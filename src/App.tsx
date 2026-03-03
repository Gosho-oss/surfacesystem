import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Profile } from './types';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import Admin from './pages/Admin';
import Layout from './components/Layout';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route element={<Layout session={session} profile={profile} />}>
          <Route 
            path="/dashboard" 
            element={session ? <Dashboard session={session} profile={profile} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/create-order" 
            element={session ? <CreateOrder session={session} profile={profile} /> : <Navigate to="/auth" />} 
          />
          
          {/* Admin Only Route */}
          <Route 
            path="/admin" 
            element={
              session && profile?.role === 'admin' 
                ? <Admin session={session} /> 
                : <Navigate to="/dashboard" />
            } 
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
