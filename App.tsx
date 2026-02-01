import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { ProfileSelection } from './pages/ProfileSelection';
import { Search } from './pages/Search';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ContentManager } from './pages/admin/ContentManager';
import { SectionManager } from './pages/admin/SectionManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { PlanManager } from './pages/admin/PlanManager';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { InfoPage } from './pages/InfoPage';
import { AppRoute } from './types';

const Router: React.FC = () => {
  const { user, currentProfile, isLoading } = useStore();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Admin Routes (Simple protection)
  if (currentHash.startsWith('#/admin')) {
    if (!user) {
      window.location.hash = AppRoute.LOGIN;
      return null;
    }

    switch (currentHash) {
      case '#/admin/content': return <ContentManager />;
      case '#/admin/sections': return <SectionManager />;
      case '#/admin/settings': return <SettingsManager />;
      case '#/admin/plans': return <PlanManager />;
      default: return <AdminDashboard />;
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
      </div>
    );
  }

  // Public Routes
  if (currentHash === `#${AppRoute.LOGIN}`) {
    if (user) {
      window.location.hash = AppRoute.BROWSE;
      return null;
    }
    return <Login />;
  }

  // Info Pages (Accessible to all)
  const infoRoutes = [
    AppRoute.FAQ, AppRoute.HELP, AppRoute.MEDIA, AppRoute.INVESTORS,
    AppRoute.JOBS, AppRoute.WAYS_TO_WATCH, AppRoute.TERMS, AppRoute.PRIVACY,
    AppRoute.COOKIES, AppRoute.CORPORATE, AppRoute.CONTACT, AppRoute.SPEED_TEST,
    AppRoute.LEGAL, AppRoute.ORIGINALS
  ];

  if (infoRoutes.some(route => currentHash === `#${route}`)) {
    return <InfoPage />;
  }

  // Not Logged In - Always show Landing which handles Signup flows
  if (!user) {
    return <Landing />;
  }
  
  // Logged In but Inactive Subscription (User flow)
  if (user && user.subscriptionStatus !== 'active' && user.role !== 'admin') {
      // Landing page handles the 'plans' step logic via internal useEffect
      return <Landing />;
  }

  // Logged In, but No Profile Selected
  if (user && !currentProfile) {
    return <ProfileSelection />;
  }

  // Routes for Authenticated Users
  switch (currentHash) {
    case `#${AppRoute.PROFILES}`:
      return <ProfileSelection />;
    case `#${AppRoute.SEARCH}`:
      return <Search />;
    case `#${AppRoute.TV_SHOWS}`:
      return <Home category="tv" />;
    case `#${AppRoute.MOVIES}`:
      return <Home category="movie" />;
    case `#${AppRoute.NEW_POPULAR}`:
      return <Home category="new" />;
    case `#${AppRoute.MY_LIST}`:
      return <Home category="my-list" />;
    case `#${AppRoute.ACCOUNT}`:
      return <Account />;
    default:
      return <Home />;
  }
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
};

export default App;