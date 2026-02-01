import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { AppRoute } from '../types';
import { PlusCircle } from 'lucide-react';

export const ProfileSelection: React.FC = () => {
  const { profiles, selectProfile, addProfile } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [kids, setKids] = useState(false);
  const presets = [
    { label: 'Me', kids: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me' },
    { label: 'Dad', kids: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dad' },
    { label: 'Mom', kids: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom' },
    { label: 'Child', kids: true, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Child' },
    { label: 'Guest', kids: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' }
  ];

  const handleSelect = (profileId: string) => {
    selectProfile(profileId);
    window.location.hash = AppRoute.BROWSE;
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <h1 className="text-3xl md:text-5xl text-white font-medium mb-12">Who's watching?</h1>
      {profiles.length === 0 && (
        <div className="mb-8 max-w-md text-center text-gray-300">
          Create profiles for family members. Kids profiles offer a safer experience with age-appropriate content.
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className="group flex flex-col items-center gap-4 cursor-pointer w-24 md:w-40"
            onClick={() => handleSelect(profile.id)}
          >
            <div className="w-24 h-24 md:w-40 md:h-40 rounded overflow-hidden border-2 border-transparent group-hover:border-white transition duration-300">
              <img
                src={profile.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
                }}
              />
            </div>
            <span className="text-gray-400 group-hover:text-white text-lg md:text-xl transition duration-300">
              {profile.name}
            </span>
          </div>
        ))}

        {/* Add Profile Button */}
        {isAdding ? (
          <div className="flex flex-col items-center gap-4 w-24 md:w-40 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-[#333] rounded flex items-center justify-center overflow-hidden border-2 border-gray-600">
              <img src="https://occ-0-64-58.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsToshpK6007kc/AAAABXYofBtCiQzmk7LrwdaGW7FLR8rZ1s_N4sZ08W6r3_88b19o5q9q0a-7.png?r=88c" alt="New" className="opacity-50 w-full h-full object-cover" />
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="bg-[#333] border border-white/30 text-white px-2 py-1 outline-none w-full text-center text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name) {
                  addProfile(name, kids);
                  setIsAdding(false);
                  setName('');
                  setKids(false);
                }
              }}
            />
            <label className="text-xs text-gray-300 flex items-center gap-2">
              <input type="checkbox" className="accent-[#e50914]" checked={kids} onChange={(e) => setKids(e.target.checked)} />
              Kids profile
            </label>
            <div className="flex gap-2 justify-center w-full">
              <button onClick={() => { if (name) { addProfile(name, kids); setIsAdding(false); setName(''); setKids(false); } }} className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase hover:bg-red-600 hover:text-white transition">Save</button>
              <button onClick={() => setIsAdding(false)} className="border border-gray-500 text-gray-500 text-[10px] font-bold px-2 py-1 uppercase hover:border-white hover:text-white transition">Cancel</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsAdding(true)}
            className="group flex flex-col items-center gap-4 cursor-pointer w-24 md:w-40"
          >
            <div className="w-24 h-24 md:w-40 md:h-40 rounded flex items-center justify-center bg-transparent group-hover:bg-white transition duration-300 border-2 border-transparent group-hover:border-white">
              <PlusCircle className="text-gray-400 group-hover:text-gray-800 w-16 h-16" />
            </div>
            <span className="text-gray-400 group-hover:text-white text-lg md:text-xl transition duration-300">
              Add Profile
            </span>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3 px-6">
        {presets.map(preset => {
          const exists = profiles.some(pr => pr.name.toLowerCase() === preset.label.toLowerCase());
          return (
            <button
              key={preset.label}
              className={`px-3 py-1 rounded-full border text-xs md:text-sm ${exists ? 'bg-[#2b2b2b] border-gray-800 text-gray-600 cursor-not-allowed opacity-50' : 'bg-[#2b2b2b] border-gray-700 text-gray-300 hover:text-white hover:border-white'}`}
              disabled={exists}
              onClick={() => addProfile(preset.label, preset.kids, preset.avatarUrl)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <button className="mt-20 border border-gray-500 text-gray-500 px-8 py-2 tracking-widest hover:text-white hover:border-white transition uppercase text-sm md:text-lg">
        Manage Profiles
      </button>
    </div>
  );
};
