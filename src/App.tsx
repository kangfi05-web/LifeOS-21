// LifeOS Main Application

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { useAppStore } from './stores';
import { ThemeProvider } from './design-system';
import { ToastProvider } from './components/ui';
import {
  Dashboard,
  GoalsPage,
  WalletPage,
  CalendarPage,
  AnalyticsPage,
  AchievementsPage,
  LifeJourneyPage,
  DreamUniversePage,
  SimulatorPage,
  SettingsPage,
} from './pages';

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
            {renderPage()}
          </AnimatePresence>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
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
