import React from 'react';
import { Home, Search, Tv, User, Download } from 'lucide-react';
import { AppRoute } from '../types';

interface MobileNavProps {
    user: any;
}

export const MobileNav: React.FC<MobileNavProps> = ({ user }) => {
    if (!user) return null;

    const navigate = (route: AppRoute) => {
        window.location.hash = route;
    };

    const isActive = (route: AppRoute) => window.location.hash === '#' + route;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-gray-800 z-[90] lg:hidden flex items-center justify-around px-2 pb-safe">
            <div
                onClick={() => navigate(AppRoute.BROWSE)}
                className={`flex flex-col items-center gap-1 w-full py-2 ${isActive(AppRoute.BROWSE) ? 'text-white' : 'text-gray-500'}`}
            >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Home</span>
            </div>

            <div
                onClick={() => navigate(AppRoute.NEW_POPULAR)}
                className={`flex flex-col items-center gap-1 w-full py-2 ${isActive(AppRoute.NEW_POPULAR) ? 'text-white' : 'text-gray-500'}`}
            >
                <Tv className="w-5 h-5" />
                <span className="text-[10px]">Coming Soon</span>
            </div>

            <div
                onClick={() => navigate(AppRoute.SEARCH)} // Using Search route but often apps have dedicated Downloads
                className={`flex flex-col items-center gap-1 w-full py-2 ${isActive(AppRoute.SEARCH) ? 'text-white' : 'text-gray-500'}`}
            >
                <Download className="w-6 h-6 p-0.5 border-2 border-current rounded-full" />
                <span className="text-[10px]">Downloads</span>
            </div>

            <div
                onClick={() => navigate(AppRoute.SEARCH)}
                className={`flex flex-col items-center gap-1 w-full py-2 ${isActive(AppRoute.SEARCH) ? 'text-white' : 'text-gray-500'}`}
            >
                <Search className="w-5 h-5" />
                <span className="text-[10px]">Search</span>
            </div>

            <div
                onClick={() => navigate(AppRoute.ACCOUNT)}
                className={`flex flex-col items-center gap-1 w-full py-2 ${isActive(AppRoute.ACCOUNT) ? 'text-white' : 'text-gray-500'}`}
            >
                <User className="w-5 h-5" />
                <span className="text-[10px]">My Netflix</span>
            </div>
        </div>
    );
};
