import React, { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, TabId } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Code-splitting lazy loaded page chunks for dynamic bundle performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TodayPage = lazy(() => import('./pages/TodayPage').then(m => ({ default: m.TodayPage })));
const HabitsPage = lazy(() => import('./pages/HabitsPage').then(m => ({ default: m.HabitsPage })));
const PlannerPage = lazy(() => import('./pages/PlannerPage').then(m => ({ default: m.PlannerPage })));
const FriendsPage = lazy(() => import('./pages/FriendsPage').then(m => ({ default: m.FriendsPage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const queryClient = new QueryClient();

export type AppRoute = 'landing' | 'login' | 'signup' | 'app';

const PageLoader: React.FC = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading view...</div>
  </div>
);

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [route, setRoute] = useState<AppRoute>('app');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading GrowTogether Session...</div>
      </div>
    );
  }

  // PROTECTED ROUTE GUARD: If unauthenticated, redirect app access to login
  if (!isAuthenticated && route === 'app') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage
          onNavigateToSignup={() => setRoute('signup')}
          onLoginSuccess={() => setRoute('app')}
        />
      </Suspense>
    );
  }

  if (route === 'landing') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage
          onNavigateToLogin={() => setRoute('login')}
          onNavigateToSignup={() => setRoute('signup')}
          onNavigateToDemo={() => setRoute('app')}
        />
      </Suspense>
    );
  }

  if (route === 'login') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage
          onNavigateToSignup={() => setRoute('signup')}
          onLoginSuccess={() => setRoute('app')}
        />
      </Suspense>
    );
  }

  if (route === 'signup') {
    return (
      <Suspense fallback={<PageLoader />}>
        <SignupPage
          onNavigateToLogin={() => setRoute('login')}
          onSignupSuccess={() => setRoute('app')}
        />
      </Suspense>
    );
  }

  const renderTabPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'today':
        return <TodayPage />;
      case 'habits':
        return <HabitsPage />;
      case 'planner':
        return <PlannerPage />;
      case 'friends':
        return <FriendsPage />;
      case 'progress':
        return <ProgressPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="gt-app-root">
      <Navbar />
      <div className="gt-app-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="gt-main-content">
          <Suspense fallback={<PageLoader />}>
            {renderTabPage()}
          </Suspense>
        </main>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
