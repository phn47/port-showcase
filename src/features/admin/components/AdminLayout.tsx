import React, { useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth, useSignOut } from '@/hooks/useAuth';
import { LayoutDashboard, Image, Clock, Briefcase, LogOut, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { signOut } = useSignOut();

  // Enable cursor in admin
  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, []);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/artworks', label: 'Artworks', icon: Image },
    { path: '/admin/timeline', label: 'Timeline', icon: Clock },
    { path: '/admin/blog', label: 'Blog', icon: FileText },
    { path: '/admin/services', label: 'Services', icon: Briefcase },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white cursor-auto">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-72 border-r border-white/10 flex flex-col bg-black/95 backdrop-blur-sm z-50">
        {/* Logo Section */}
        <div className="p-8 border-b border-white/10 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-2">9F</h1>
            <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-mono">Admin Portal</p>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={item.path}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-300 relative ${isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={22} className={isActive ? 'text-black' : 'text-gray-400 group-hover:text-white transition-colors'} />
                  <span className="font-mono text-sm uppercase tracking-wider font-bold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-6 space-y-4 flex-shrink-0">


          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/30 group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-sm uppercase tracking-wider font-bold">Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 min-h-screen bg-black overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
