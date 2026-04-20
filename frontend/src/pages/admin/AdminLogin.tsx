// frontend/src/pages/admin/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-dm">
      <div className="max-w-md w-full space-y-8 z-10 bg-white p-12 border border-fm-border shadow-sm">
        <div className="text-center">
            <span className="font-playfair text-fm-text text-2xl font-black tracking-tighter">
              FM MOBILE
            </span>
          <p className="text-fm-text-3 text-[11px] font-bold uppercase tracking-[4px]">
            Admin Portal
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-fm-border bg-fm-bg text-fm-text placeholder-fm-text-3 outline-none focus:border-fm-text transition-colors text-[13px]"
                placeholder="Admin Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-fm-border bg-fm-bg text-fm-text placeholder-fm-text-3 outline-none focus:border-fm-text transition-colors text-[13px]"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 bg-fm-text text-white hover:bg-fm-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[13px] font-medium"
            >
              {isLoading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                   Authenticating...
                 </>
              ) : 'Sign in to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
