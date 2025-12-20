import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignIn } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading } = useSignIn();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      // Wait a bit for auth state to update
      setTimeout(() => {
        navigate('/admin');
        window.location.reload(); // Reload to refresh auth state
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono cursor-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-12 relative z-10"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-8xl font-black uppercase tracking-tighter mb-4 leading-none">9F</h1>
          <p className="text-sm text-gray-400 uppercase tracking-[0.3em] font-mono">Admin Portal</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-xs uppercase tracking-wider mb-3 font-bold text-gray-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-12 py-4 focus:border-white focus:outline-none focus:bg-white/10 transition-all font-mono text-sm"
                placeholder="admin@9f.com"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-xs uppercase tracking-wider mb-3 font-bold text-gray-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-12 py-4 focus:border-white focus:outline-none focus:bg-white/10 transition-all font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 text-sm font-mono uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-4 font-black uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm group relative overflow-hidden"
          >
            <span className="relative z-10">{isLoading ? 'Logging in...' : 'Login'}</span>
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
