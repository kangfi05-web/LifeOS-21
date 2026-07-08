// LifeOS Main Application

import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { useAppStore } from './stores';
import { ThemeProvider } from './design-system';
import { ToastProvider } from './components/ui';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const GoalsPage = lazy(() => import('./pages/Goals').then((m) => ({ default: m.GoalsPage })));
const WalletPage = lazy(() => import('./pages/Wallet').then((m) => ({ default: m.WalletPage })));
const CalendarPage = lazy(() => import('./pages/Calendar').then((m) => ({ default: m.CalendarPage })));
const AnalyticsPage = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.AnalyticsPage })));
const AchievementsPage = lazy(() => import('./pages/Achievements').then((m) => ({ default: m.AchievementsPage })));
const LifeJourneyPage = lazy(() => import('./pages/LifeJourney').then((m) => ({ default: m.LifeJourneyPage })));
const DreamUniversePage = lazy(() => import('./pages/DreamUniverse').then((m) => ({ default: m.DreamUniversePage })));
const SimulatorPage = lazy(() => import('./pages/Simulator').then((m) => ({ default: m.SimulatorPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then((m) => ({ default: m.SettingsPage })));

function App() {
  const { initialize, initialized, loading, currentPage } = useAppStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'goals':
        return <GoalsPage />;
      case 'wallet':
        return <WalletPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'journey':
        return <LifeJourneyPage />;
      case 'universe':
        return <DreamUniversePage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  if (loading && !initialized) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <Layout>
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoadingFallback />}>
              {renderPage()}
            </Suspense>
          </AnimatePresence>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
}

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">L</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">LifeOS</h1>
        <p className="text-muted-foreground">Memuat aplikasi...</p>
      </div>
    </div>
  );
}

export default App;
