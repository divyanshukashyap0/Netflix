import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { AppRoute } from '../types';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  const { user, logout, currentProfile, profiles, selectProfile, searchQuery, setSearchQuery } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.hash = AppRoute.SEARCH;
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {showNav && (
        <nav
          className={`fixed w-full z-[100] transition-colors duration-500 ease-in-out px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}
        >
          <div className="flex items-center gap-8">
            <img
              src="/logoN.png"
              alt="NETFLIX"
              className="h-16 md:h-20 cursor-pointer object-contain"
              onClick={() => window.location.hash = AppRoute.BROWSE}
            />
            {user && (
              <ul className="hidden lg:flex gap-5 text-sm font-medium text-gray-200">
                <li className="hover:text-gray-400 cursor-pointer transition" onClick={() => window.location.hash = AppRoute.BROWSE}>Home</li>
                <li className="hover:text-gray-400 cursor-pointer transition" onClick={() => window.location.hash = AppRoute.TV_SHOWS}>TV Shows</li>
                <li className="hover:text-gray-400 cursor-pointer transition" onClick={() => window.location.hash = AppRoute.MOVIES}>Movies</li>
                <li className="hover:text-gray-400 cursor-pointer transition" onClick={() => window.location.hash = AppRoute.NEW_POPULAR}>New & Popular</li>
                <li className="hover:text-gray-400 cursor-pointer transition" onClick={() => window.location.hash = AppRoute.MY_LIST}>My List</li>
              </ul>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {user ? (
              <>
                <form onSubmit={handleSearchSubmit} className={`flex items-center border border-white/0 ${searchOpen ? 'border-white/100 bg-black/80' : ''} transition-all duration-300 p-1`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (searchOpen && !searchQuery) setSearchOpen(false);
                      else { setSearchOpen(true); document.getElementById('searchInput')?.focus(); }
                    }}
                  >
                    <Search className="w-6 h-6" />
                  </button>
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Titles, people, genres"
                    className={`${searchOpen ? 'w-60 px-2' : 'w-0 px-0'} bg-transparent transition-all duration-300 focus:outline-none text-sm`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                </form>

                <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300" />

                <div className="relative group">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                  >
                    <img
                      src={currentProfile?.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
                      }}
                    />
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                  </div>

                  {showAccountMenu && (
                    <div className="absolute right-0 mt-4 w-56 bg-black/90 border border-gray-700 rounded shadow-xl py-2 z-50">
                      <div className="py-2 px-3 flex flex-col gap-2 border-b border-gray-700">
                        {/* Show other profiles */}
                        {profiles.filter(p => p.id !== currentProfile?.id).map(profile => (
                          <div
                            key={profile.id}
                            className="flex items-center gap-3 hover:underline cursor-pointer"
                            onClick={() => selectProfile(profile.id)}
                          >
                            <img src={profile.avatarUrl} className="w-8 h-8 rounded" alt={profile.name} />
                            <span className="text-sm text-gray-300">{profile.name}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 hover:underline cursor-pointer" onClick={() => window.location.hash = AppRoute.PROFILES}>
                          <span className="text-sm text-gray-300 ml-11 hover:text-white">Manage Profiles</span>
                        </div>
                      </div>

                      <div className="py-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-white hover:underline" onClick={() => window.location.hash = AppRoute.ACCOUNT}>Account</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-white hover:underline" onClick={() => window.location.hash = AppRoute.HELP}>Help Center</button>
                        {user.role === 'admin' && (
                          <button className="w-full text-left px-4 py-2 text-sm text-white hover:underline text-red-500 font-bold" onClick={() => window.location.hash = AppRoute.ADMIN}>Admin Dashboard</button>
                        )}
                      </div>
                      <button
                        className="w-full text-center px-4 py-3 text-sm text-white hover:underline border-t border-gray-700 mt-2"
                        onClick={() => {
                          logout();
                          window.location.hash = AppRoute.LANDING;
                        }}
                      >
                        Sign out of NETFLIX
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => window.location.hash = AppRoute.LOGIN}
                className="bg-[#e50914] px-4 py-1.5 rounded text-sm font-medium hover:bg-[#f40612] transition"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      )}
      <main>
        {children}
      </main>
    </div>
  );
};
