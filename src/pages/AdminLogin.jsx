import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Loader2, ShieldCheck, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from || '/';

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      navigate('/', { replace: true });
    }
    if (!loading && isAuthenticated && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      let displayError = signInError.message;
      if (displayError === 'Invalid login credentials') {
        displayError = 'อีเมลไม่ถูกต้อง หรือรหัสผ่านผิด';
      }
      setError(displayError);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-cyan-900 px-8 py-8 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-4">
            <UserCog size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin User Login</h1>
          <p className="text-white/80 text-sm mt-2">
            Central Office เท่านั้นที่จะเข้าถึงหน้าจัดการข้อมูลได้
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-950">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-950">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-950 text-white py-3.5 font-black tracking-wide hover:bg-cyan-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
            เข้าสู่ระบบผู้ดูแล
          </button>


        </form>
      </div>
    </div>
  );
}
