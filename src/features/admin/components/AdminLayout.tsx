import React, { useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth, useSignOut } from '@/hooks/useAuth';
import { LayoutDashboard, Image, Clock, Settings, LogOut } from 'lucide-react';

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
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white flex cursor-auto">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">9F</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-mono text-sm uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="px-4 py-2 text-xs text-gray-400 mb-4">
            <div className="uppercase tracking-wider">Logged in as</div>
            <div className="text-white mt-1">{user?.email}</div>
            <div className="text-gray-500 mt-1">Role: {user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-mono text-sm uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
