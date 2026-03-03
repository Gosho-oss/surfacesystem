import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Percent,
  Search,
  Filter,
  ShieldAlert
} from 'lucide-react';

export default function Admin({ session }: { session: Session }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [storageStatus, setStorageStatus] = useState<'ok' | 'missing' | 'checking'>('checking');

  const checkStorage = async () => {
    const { data, error } = await supabase.storage.getBucket('wallpapers');
    setStorageStatus(error || !data ? 'missing' : 'ok');
  };

  const fetchData = async () => {
    setLoading(true);
    const [ordersRes, usersRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    if (usersRes.data) setUsers(usersRes.data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    checkStorage();
  }, []);

  const updateOrderStatus = async (orderId: string, status: 'completed' | 'pending') => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      if (status === 'completed') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data as Profile[]);
      }
    }
  };

  const updateDiscount = async (userId: string, discount: number) => {
    const { error } = await supabase
      .from('profiles')
      .update({ discount_percentage: discount })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, discount_percentage: discount } : u));
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will mark them as deleted.')) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_deleted: true })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_deleted: true } : u));
    }
  };

  const filteredOrders = orders.filter(o => 
    o.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.client_id?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-zinc-100 rounded-2xl w-64" />
        <div className="h-96 bg-zinc-100 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Control</h1>
          <p className="text-zinc-500 mt-2">Manage global orders and client relations.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
            storageStatus === 'ok' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${storageStatus === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {storageStatus === 'ok' ? 'Storage: Online' : 'Storage: Error'}
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'orders' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'users' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
          />
        </div>
        <button className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-500 hover:text-zinc-900 transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-400">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Order & Client</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Specs</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Financials</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">File</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-zinc-400 mb-1">#{order.id.split('-')[0]}</span>
                        <span className="font-bold text-zinc-900">{order.user_email}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">CID: {order.client_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{order.width}×{order.height}cm</span>
                        <span className="text-xs text-zinc-500">{order.material}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">€{order.final_price.toFixed(2)}</span>
                        {order.discount_applied > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">Disc: -€{order.discount_applied.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <a
                        href={order.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <span className="text-xs font-mono uppercase">{(order.file_size / (1024 * 1024)).toFixed(1)}MB</span>
                      </a>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {order.status === 'pending' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center space-x-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'pending')}
                          className="text-zinc-400 hover:text-zinc-600 text-xs font-bold flex items-center space-x-2"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Revert</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-400">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Client Info</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Activity</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Revenue</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Discount</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-zinc-50/50 transition-colors ${user.is_deleted ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{user.email}</span>
                        <span className="text-xs text-zinc-400 font-mono">ID: {user.client_id}</span>
                        {user.role === 'admin' && (
                          <span className="mt-1 inline-flex w-fit px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-bold uppercase rounded">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-4 h-4 text-zinc-300" />
                        <span className="font-bold text-zinc-900">{user.total_orders}</span>
                        <span className="text-zinc-400 text-xs">orders</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-zinc-900">
                      €{user.total_spent.toFixed(2)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={user.discount_percentage}
                            onChange={(e) => updateDiscount(user.id, parseInt(e.target.value) || 0)}
                            className="w-20 pl-6 pr-2 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold focus:ring-2 focus:ring-zinc-900 transition-all"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {!user.is_deleted && user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-zinc-300 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {user.is_deleted && (
                        <span className="text-[10px] font-bold text-red-600 uppercase">Deleted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
