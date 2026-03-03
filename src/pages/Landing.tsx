import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  Maximize,
  Printer,
  Truck,
  UploadCloud
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">WallPrint Pro</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-500">
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#loyalty" className="hover:text-zinc-900 transition-colors">Loyalty</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Log In</Link>
            <Link 
              to="/auth" 
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
            >
              Start Ordering
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest mb-6">
              For Interior Designers
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
              Professional Large-Format <br />
              <span className="text-zinc-400">Wallpaper Ordering</span>
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload. Customize. Print. Delivered. The premium platform built specifically for design professionals who demand precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/auth" 
                className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-zinc-800 transition-all flex items-center justify-center group"
              >
                Start Your First Order
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
                View Sample Materials
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/interior/1600/900" 
                alt="Modern Interior" 
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            </div>
            {/* Floating UI Elements */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-zinc-100 hidden lg:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold">Premium Quality</div>
                  <div className="text-xs text-zinc-500">Eco-friendly materials</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-500">Three simple steps to professional results.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: UploadCloud, title: "Upload Design", desc: "Upload your high-resolution JPG, PNG, or PDF files directly to our secure cloud." },
              { icon: Maximize, title: "Customize Size", desc: "Specify exact dimensions down to the centimeter. Large format support up to 10m." },
              { icon: Truck, title: "Fast Delivery", desc: "We print on premium materials and ship directly to your project site in 3-5 days." }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Format Advantage */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                The Large Format <br />
                <span className="text-zinc-400">Advantage</span>
              </h2>
              <p className="text-lg text-zinc-500 mb-8 leading-relaxed">
                Standard printers struggle with scale. Our industrial-grade equipment ensures seamless patterns and vibrant colors even on the largest walls.
              </p>
              <ul className="space-y-4">
                {[
                  "Seamless panel matching technology",
                  "UV-resistant inks for long-lasting color",
                  "Custom sizing up to 1000cm x 400cm",
                  "Premium material options for every environment"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-zinc-700 font-medium">
                    <div className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://picsum.photos/seed/print1/400/500" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/print2/400/300" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://picsum.photos/seed/print3/400/300" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/print4/400/500" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Benefits */}
      <section id="loyalty" className="py-24 bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-800/50 -skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">Designed for Loyalty</h2>
            <p className="text-zinc-400 text-lg mb-12">
              We value long-term partnerships. Our automatic loyalty system rewards your volume with significant discounts.
            </p>
            <div className="space-y-6">
              {[
                { tier: "Tier 1", count: "5 Orders", discount: "5% OFF" },
                { tier: "Tier 2", count: "15 Orders", discount: "10% OFF" },
                { tier: "Tier 3", count: "30 Orders", discount: "15% OFF" }
              ].map((tier, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold">{tier.tier}</div>
                      <div className="text-sm text-zinc-400">After {tier.count}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{tier.discount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">WallPrint Pro</span>
              </div>
              <p className="text-zinc-500 max-w-xs leading-relaxed">
                The professional standard for custom wallpaper printing. Built for designers, by designers.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-900 transition-colors">Materials</a></li>
                <li><a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-zinc-900 transition-colors">Samples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-zinc-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
            <p>© 2024 WallPrint Pro. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-zinc-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Instagram</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
