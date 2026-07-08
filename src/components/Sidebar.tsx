// Sidebar Navigation Component

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Wallet,
  Calendar,
  BarChart3,
  Trophy,
  Compass,
  Settings,
  Sun,
  Sparkles,
  Flame,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAppStore, useDashboardStore } from '../stores';
import { formatCurrency } from '../utils/calculations';
import { useTheme } from '../design-system';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'goals', label: 'Target', icon: Target },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'analytics', label: 'Statistik', icon: BarChart3 },
  { id: 'achievements', label: 'Achievement', icon: Trophy },
  { id: 'journey', label: 'Life Journey', icon: Compass },
  { id: 'universe', label: 'Dream Universe', icon: Sparkles },
];

const bottomNavItems: NavItem[] = [
  { id: 'simulator', label: 'Simulator', icon: TrendingUp },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, currentPage, setCurrentPage, setSidebarOpen } = useAppStore();
  const { summary, dailySummary } = useDashboardStore();
  const { theme, setTheme } = useTheme();

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`
          fixed left-0 top-0 h-full w-64
          bg-surface border-r border-white/5
          flex flex-col z-40
          transition-transform duration-300
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">LifeOS</h1>
              <p className="text-xs text-base-400">Financial OS</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-base-950/50 rounded-xl p-3">
              <p className="text-xs text-base-400 mb-1">Target Aktif</p>
              <p className="text-xl font-bold text-white">{summary?.activeGoals || 0}</p>
            </div>
            <div className="bg-base-950/50 rounded-xl p-3">
              <p className="text-xs text-base-400 mb-1">Dana Hari Ini</p>
              <p className="text-xl font-bold text-success">
                {dailySummary ? formatCurrency(dailySummary.todayCollected) : formatCurrency(0)}
              </p>
            </div>
          </div>

          {/* Streak */}
          <div className="mt-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-base-400">Streak</p>
              <p className="text-lg font-bold text-amber-400">7 hari</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-base-500 uppercase tracking-wider mb-3 px-3">Tools</p>
            <div className="space-y-1">
              {bottomNavItems.map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={currentPage === item.id}
                  onClick={() => handleNavClick(item.id)}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-base-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Sun className="w-5 h-5" />
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavItemComponent({ item, isActive, onClick }: NavItemComponentProps) {
  const Icon = item.icon;

  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200
        ${isActive
          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
          : 'text-base-300 hover:text-white hover:bg-white/5'
        }
      `}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
      {item.badge && (
        <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </motion.button>
  );
}
