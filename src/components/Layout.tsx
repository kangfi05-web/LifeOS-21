// Main Layout Component

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CommandCenter } from './CommandCenter';
import { useAppStore, useCommandCenterStore } from '../stores';
import { QuickAddModal } from '../modals/QuickAddModal';
import { GoalModal } from '../modals/GoalModal';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, setSidebarOpen, currentPage } = useAppStore();
  const { toggle: toggleCommandCenter } = useCommandCenterStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [quickAddPrefillAmount, setQuickAddPrefillAmount] = useState<number | undefined>(undefined);
  const [goalPrefillTitle, setGoalPrefillTitle] = useState<string | undefined>(undefined);

  // Global keyboard shortcut for Command Center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CTRL+K or CMD+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandCenter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandCenter]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      goals: 'Target',
      wallet: 'Wallet',
      calendar: 'Kalender',
      analytics: 'Statistik',
      achievements: 'Achievement',
      journey: 'Life Journey',
      universe: 'Dream Universe',
      simulator: 'Simulator',
      settings: 'Pengaturan',
    };
    return titles[currentPage] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-base-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent/10" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-base-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg md:text-xl font-semibold">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button - Opens Command Center */}
              <button
                onClick={toggleCommandCenter}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/5 rounded-xl hover:border-white/10 transition-colors"
              >
                <Search className="w-4 h-4 text-base-400" />
                <span className="hidden md:inline text-sm text-base-400">Cari...</span>
                <kbd className="hidden md:inline px-1.5 py-0.5 bg-white/5 rounded text-xs text-base-400">Ctrl+K</kbd>
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>

              {/* User Avatar */}
              <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
                <span className="text-sm font-semibold">U</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent
          flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-shadow"
        aria-label="Add new"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Mobile Quick Search FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleCommandCenter}
        className="fixed left-6 bottom-6 z-50 w-12 h-12 rounded-full bg-surface border border-white/10
          flex items-center justify-center shadow-xl lg:hidden"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </motion.button>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddModal
            initialAmount={quickAddPrefillAmount}
            onClose={() => {
              setShowQuickAdd(false);
              setQuickAddPrefillAmount(undefined);
            }}
          />
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <GoalModal
            initialTitle={goalPrefillTitle}
            onClose={() => {
              setShowGoalModal(false);
              setGoalPrefillTitle(undefined);
            }}
          />
        )}
      </AnimatePresence>

      {/* Command Center */}
      <CommandCenter
        onOpenGoalModal={(title) => {
          setGoalPrefillTitle(title);
          setShowGoalModal(true);
        }}
        onOpenQuickAdd={(amount) => {
          setQuickAddPrefillAmount(amount);
          setShowQuickAdd(true);
        }}
      />
    </div>
  );
}
