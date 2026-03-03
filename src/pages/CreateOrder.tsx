import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { MaterialType, MATERIAL_PRICES, Profile } from '../types';
import { UploadCloud, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateOrder({ session, profile }: { session: Session, profile: Profile | null }) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [material, setMaterial] = useState<MaterialType>('Standard Matte');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const LARGE_FORMAT_THRESHOLD = 300; // cm
  const LARGE_FORMAT_FEE_PERCENT = 0.15; // 15%

  const pricing = useMemo(() => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w <= 0 || h <= 0) return { base: 0, fee: 0, discount: 0, final: 0, isLarge: false };

    const base = (w / 100) * (h / 100) * MATERIAL_PRICES[material];
    const isLarge = w > LARGE_FORMAT_THRESHOLD || h > LARGE_FORMAT_THRESHOLD;
    const fee = isLarge ? base * LARGE_FORMAT_FEE_PERCENT : 0;
    
    // Use profile discount or 0
    const discountPercent = profile?.discount_percentage || 0;
    const discount = (base + fee) * (discountPercent / 100);
    
    const final = base + fee - discount;

    return { base, fee, discount, final, isLarge };
  }, [width, height, material, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a design file.');
      return;
    }
    if (pricing.final <= 0) {
      setError('Please enter valid dimensions.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('wallpapers')
        .upload(fileName, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "wallpapers" not found. Please create a public bucket named "wallpapers" in your Supabase Storage dashboard.');
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('wallpapers')
        .getPublicUrl(fileName);

      // 2. Save to DB
      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          client_id: profile?.client_id,
          user_id: session.user.id,
          user_email: session.user.email,
          width: parseFloat(width),
          height: parseFloat(height),
          material,
          base_price: pricing.base,
          discount_applied: pricing.discount,
          large_format_fee: pricing.fee,
          final_price: pricing.final,
          file_url: publicUrlData.publicUrl,
          file_size: file.size,
          status: 'pending'
        });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while placing the order.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-[32px] border border-zinc-200 p-16 text-center shadow-sm">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">Order Received</h2>
        <p className="text-zinc-500 mb-10 text-lg leading-relaxed">Your custom wallpaper order has been placed and is now in our production queue.</p>
        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">New Project</h1>
        <p className="text-zinc-500 mt-2 text-lg">Configure your custom wallpaper specifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10">
          {/* File Upload */}
          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">1. Design Asset</h2>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-12 text-center hover:bg-zinc-50/50 transition-all relative group">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-zinc-400" />
              </div>
              {file ? (
                <div className="space-y-1">
                  <div className="text-zinc-900 font-bold">{file.name}</div>
                  <div className="text-zinc-400 text-xs font-mono uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
              ) : (
                <>
                  <div className="text-zinc-900 font-bold mb-1">Upload high-res design</div>
                  <div className="text-zinc-400 text-sm">JPG, PNG, or PDF up to 50MB</div>
                </>
              )}
            </div>
          </div>

          {/* Dimensions & Material */}
          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-zinc-900">2. Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Width (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all font-bold text-lg"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Height (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all font-bold text-lg"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Material Selection</label>
              <div className="grid grid-cols-1 gap-4">
                {(Object.keys(MATERIAL_PRICES) as MaterialType[]).map((mat) => (
                  <label
                    key={mat}
                    className={`relative flex cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                      material === mat
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                        : 'border-zinc-100 hover:border-zinc-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="material"
                      value={mat}
                      checked={material === mat}
                      onChange={(e) => setMaterial(e.target.value as MaterialType)}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{mat}</span>
                        <span className={`text-sm ${material === mat ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Professional grade finish
                        </span>
                      </div>
                      <span className={`font-bold text-lg ${material === mat ? 'text-emerald-400' : 'text-zinc-900'}`}>
                        €{MATERIAL_PRICES[mat]}<span className="text-xs font-normal">/m²</span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] border border-zinc-200 shadow-xl p-8 sticky top-28">
            <h2 className="text-xl font-bold text-zinc-900 mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Base Price</span>
                <span className="font-bold">€{pricing.base.toFixed(2)}</span>
              </div>
              
              {pricing.isLarge && (
                <div className="flex justify-between text-sm text-amber-600">
                  <div className="flex items-center">
                    <span>Large Format Fee</span>
                    <Info className="w-3 h-3 ml-1" />
                  </div>
                  <span className="font-bold">+€{pricing.fee.toFixed(2)}</span>
                </div>
              )}

              {pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="font-medium">Loyalty Discount ({profile?.discount_percentage}%)</span>
                  <span className="font-bold">-€{pricing.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-100 flex justify-between items-end">
                <span className="text-zinc-900 font-bold">Total</span>
                <span className="text-4xl font-bold tracking-tight text-zinc-900">€{pricing.final.toFixed(2)}</span>
              </div>
            </div>

            {pricing.isLarge && (
              <div className="bg-amber-50 rounded-2xl p-4 mb-8 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Dimensions exceed 300cm. A 15% large-format handling fee has been applied for specialized printing.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || pricing.final <= 0 || !file}
              className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-zinc-200"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-2xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
