import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';
import { LogOut, LayoutDashboard, PlusCircle, ShieldCheck, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout({ session, profile }: { session: Session | null, profile: Profile | null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) return <Outlet />;

  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create-order', label: 'New Order', icon: PlusCircle },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900">WallPrint Pro</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={clsx(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2",
                      isActive 
                        ? "bg-zinc-100 text-zinc-900" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
              <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 leading-none">{session.user.email?.split('@')[0]}</span>
                {profile?.client_id && (
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">ID: {profile.client_id}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-zinc-900 p-2 rounded-full hover:bg-zinc-100 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
