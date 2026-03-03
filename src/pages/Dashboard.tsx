import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, Profile, LOYALTY_TIERS } from '../types';
import { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { PlusCircle, FileImage, Clock, CheckCircle2, Award, TrendingUp } from 'lucide-react';

export default function Dashboard({ session, profile }: { session: Session, profile: Profile | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [session.user.id]);

  const currentTier = LOYALTY_TIERS.find(tier => (profile?.total_orders || 0) >= tier.orders);
  const nextTier = [...LOYALTY_TIERS].reverse().find(tier => (profile?.total_orders || 0) < tier.orders);
  
  const progress = nextTier 
    ? Math.min(100, ((profile?.total_orders || 0) / nextTier.orders) * 100)
    : 100;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-zinc-100 rounded-3xl" />
        <div className="h-64 bg-zinc-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Loyalty & Stats Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Loyalty Status</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  {currentTier ? currentTier.label : 'Standard Member'}
                </h2>
                <p className="text-zinc-400">
                  {nextTier 
                    ? `${nextTier.orders - (profile?.total_orders || 0)} more orders to unlock ${nextTier.discount}% discount`
                    : 'You have reached the maximum loyalty tier!'}
                </p>
              </div>
              
              <div className="flex-1 max-w-xs w-full">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                  <span className="text-zinc-500">Progress</span>
                  <span className="text-emerald-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Spent</span>
            <TrendingUp className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-4xl font-bold text-zinc-900">€{(profile?.total_spent || 0).toFixed(2)}</div>
            <div className="text-sm text-zinc-500 mt-1">{profile?.total_orders || 0} total orders</div>
          </div>
          <Link 
            to="/create-order"
            className="mt-6 w-full py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm text-center hover:bg-zinc-200 transition-colors"
          >
            New Order
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Order History</h3>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileImage className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No orders yet</h3>
            <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Start your first custom wallpaper project today.</p>
            <Link
              to="/create-order"
              className="inline-flex items-center px-8 py-3 bg-zinc-900 text-white font-bold rounded-full hover:bg-zinc-800 transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Order
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-400">
                  <tr>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Order ID</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Date</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Dimensions</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Material</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Final Price</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-8 py-6 font-mono text-xs text-zinc-400">
                        #{order.id.split('-')[0]}
                      </td>
                      <td className="px-8 py-6 text-zinc-600">
                        {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-zinc-900 font-bold">
                        {order.width} <span className="text-zinc-300 font-normal">×</span> {order.height} <span className="text-[10px] text-zinc-400 font-normal">cm</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                          {order.material}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-zinc-900">
                        €{order.final_price.toFixed(2)}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
