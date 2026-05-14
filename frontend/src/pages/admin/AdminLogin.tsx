// frontend/src/pages/admin/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../../store/api/adminApi';
import { useAppDispatch } from '../../store/store';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      if (result.success && result.token && result.admin) {
        dispatch(setCredentials({ token: result.token, admin: result.admin }));
        toast.success(`Welcome back, ${result.admin.email}`);
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 z-10 bg-navy-mid/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in">
        <div className="text-center">
            <span className="font-heading text-electric text-3xl font-extrabold tracking-tighter italic">
              FM <span className="text-white">PORTAL</span>
            </span>
          <p className="text-gray-600 text-[10px] font-extrabold uppercase tracking-[6px] mt-2">
            Administrator Access
          </p>
        </div>
        
        <form className="mt-12 space-y-8" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Admin Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-navy-dark border border-white/5 text-white placeholder-gray-800 outline-none focus:border-electric transition-all text-sm font-body"
                placeholder="admin@fmmobile.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-navy-dark border border-white/5 text-white placeholder-gray-800 outline-none focus:border-electric transition-all text-sm font-body"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-5 px-4 bg-electric text-white rounded-2xl hover:shadow-glow-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] text-[11px] font-extrabold animate-pulse-glow"
            >
              {isLoading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                   Authenticating...
                 </>
              ) : 'Access Dashboard'}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-4">
            <Link to="/" className="text-[9px] text-gray-700 font-extrabold uppercase tracking-widest hover:text-white transition-colors underline underline-offset-8">
                Back to Storefront
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
