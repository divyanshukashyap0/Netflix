import React from 'react';
import { useStore } from '../context/Store';
import { AppRoute } from '../types';
import { LayoutDashboard, Film, Layers, Settings, LogOut, Home, CreditCard } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', hash: '#/admin' },
    { icon: Film, label: 'Content', hash: '#/admin/content' },
    { icon: Layers, label: 'Sections', hash: '#/admin/sections' },
    { icon: CreditCard, label: 'Plans', hash: '#/admin/plans' },
    { icon: Settings, label: 'Settings', hash: '#/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#141414] text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <img src="/logoN.png" alt="NETFLIX ADMIN" className="h-20 object-contain mb-2" />
          <h1 className="text-[#e50914] text-sm font-bold tracking-widest uppercase">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.hash}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${window.location.hash === item.hash
                ? 'bg-[#e50914] text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}

          <div className="pt-8 mt-8 border-t border-gray-800">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
              <Home size={20} />
              <span>Back to App</span>
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => { logout(); window.location.hash = AppRoute.LOGIN; }}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 w-full rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#141414]">
        <header className="bg-black/50 backdrop-blur-md border-b border-gray-800 px-8 py-4 sticky top-0 z-10">
          <h2 className="text-xl font-semibold">{title}</h2>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};