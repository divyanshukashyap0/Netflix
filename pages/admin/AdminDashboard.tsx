import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { db } from '../../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Users, Film, PlayCircle, HardDrive } from 'lucide-react';
import { AppRoute } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    content: 0,
    sections: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const contentSnap = await getCountFromServer(collection(db, 'content'));
        const sectionsSnap = await getCountFromServer(collection(db, 'sections'));

        setStats({
          users: usersSnap.data().count,
          content: contentSnap.data().count,
          sections: sectionsSnap.data().count
        });
      } catch (e) {
        console.error("Failed to fetch stats (DB might be empty)", e);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-600' },
    { label: 'Total Content', value: stats.content, icon: Film, color: 'bg-[#e50914]' },
    { label: 'Active Sections', value: stats.sections, icon: Layers, color: 'bg-purple-600' },
    { label: 'Server Status', value: 'Online', icon: HardDrive, color: 'bg-green-600' },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-20`}>
                <card.icon className={`${card.color.replace('bg-', 'text-')}`} size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-gray-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button onClick={() => window.location.hash = AppRoute.ADMIN_CONTENT} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">Manage Content</button>
          <button onClick={() => window.location.hash = AppRoute.ADMIN_COMING_SOON} className="px-4 py-2 bg-[#e50914] hover:bg-red-700 rounded text-sm text-white font-bold">Manage Coming Soon</button>
          <button onClick={() => window.location.hash = AppRoute.ADMIN_SECTIONS} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">Edit Sections</button>
        </div>
      </div>

      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Recent System Activity</h3>
        <div className="text-gray-500 text-sm italic">
          No recent system logs found.
        </div>
      </div>
    </AdminLayout>
  );
};

import { Layers } from 'lucide-react';