// Command Center - Global Command Palette

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Target,
  Wallet,
  Plus,
  Calendar,
  BarChart3,
  Trophy,
  Compass,
  Sparkles,
  Settings,
  Download,
  Upload,
  FileText,
  ArrowRightLeft,
  Star,
  Clock,
  Home,
  TrendingUp,
  Moon,
  Sun,
  Globe,
  Command,
} from 'lucide-react';
import { useCommandCenterStore, CommandAction } from '../stores/CommandCenterStore';
import { useAppStore } from '../stores';
import { useGoalStore } from '../stores/GoalStore';
import { useWalletStore } from '../stores/WalletStore';
import { cn } from '../utils/cn';
import { useTheme } from '../design-system';

interface CommandCenterProps {
  onOpenGoalModal: () => void;
  onOpenQuickAdd: () => void;
  onOpenWalletModal?: () => void;
}

export function CommandCenter({ onOpenGoalModal, onOpenQuickAdd }: CommandCenterProps) {
  const {
    isOpen,
    searchQuery,
    selectedIndex,
    recentActions,
    favoriteActions,
    close,
    setSearchQuery,
    moveSelectionUp,
    moveSelectionDown,
    addToRecent,
    toggleFavorite,
    isFavorite,
  } = useCommandCenterStore();

  const { setCurrentPage } = useAppStore();
  const { activeGoals } = useGoalStore();
  const { wallets } = useWalletStore();
  const { setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Define all available commands
  const allCommands: CommandAction[] = useMemo(() => {
    const commands: CommandAction[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Halaman utama',
        icon: 'Home',
        category: 'navigation',
        action: () => setCurrentPage('dashboard'),
        keywords: ['home', 'utama', 'beranda'],
      },
      {
        id: 'nav-goals',
        label: 'Target Saya',
        description: 'Kelola target finansial',
        icon: 'Target',
        category: 'navigation',
        action: () => setCurrentPage('goals'),
        keywords: ['goal', 'tTarget', 'tabungan', 'saving'],
      },
      {
        id: 'nav-wallet',
        label: 'Wallet',
        description: 'Kelola sumber dana',
        icon: 'Wallet',
        category: 'navigation',
        action: () => setCurrentPage('wallet'),
        keywords: ['dompet', 'uang', 'money', 'cash'],
      },
      {
        id: 'nav-calendar',
        label: 'Kalender',
        description: 'Lihat jadwal tabungan',
        icon: 'Calendar',
        category: 'navigation',
        action: () => setCurrentPage('calendar'),
        keywords: ['schedule', 'jadwal', 'date'],
      },
      {
        id: 'nav-analytics',
        label: 'Statistik',
        description: 'Analisis keuangan',
        icon: 'BarChart3',
        category: 'navigation',
        action: () => setCurrentPage('analytics'),
        keywords: ['analytics', 'analitik', 'stat', 'report', 'laporan'],
      },
      {
        id: 'nav-achievements',
        label: 'Achievement',
        description: 'Lihat pencapaian',
        icon: 'Trophy',
        category: 'navigation',
        action: () => setCurrentPage('achievements'),
        keywords: ['achievement', 'pencapaian', 'trophy'],
      },
      {
        id: 'nav-journey',
        label: 'Life Journey',
        description: 'Perjalanan finansial',
        icon: 'Compass',
        category: 'navigation',
        action: () => setCurrentPage('journey'),
        keywords: ['journey', 'perjalanan', 'history', 'riwayat'],
      },
      {
        id: 'nav-universe',
        label: 'Dream Universe',
        description: 'Visualisasi impian',
        icon: 'Sparkles',
        category: 'navigation',
        action: () => setCurrentPage('universe'),
        keywords: ['universe', 'planet', 'dream', 'impian', 'visual'],
      },
      {
        id: 'nav-simulator',
        label: 'Simulator',
        description: 'Simulasi finansial',
        icon: 'TrendingUp',
        category: 'navigation',
        action: () => setCurrentPage('simulator'),
        keywords: ['simulator', 'simulasi', 'predict', 'prediksi'],
      },
      {
        id: 'nav-settings',
        label: 'Pengaturan',
        description: 'Konfigurasi aplikasi',
        icon: 'Settings',
        category: 'navigation',
        action: () => setCurrentPage('settings'),
        keywords: ['settings', 'pengaturan', 'config', 'konfigurasi'],
      },

      // Create
      {
        id: 'create-goal',
        label: 'Buat Target Baru',
        description: 'Tambah target finansial',
        icon: 'Plus',
        category: 'create',
        action: () => {
          onOpenGoalModal();
          close();
        },
        keywords: ['new', 'baru', 'tambah', 'add', 'create'],
      },
      {
        id: 'create-quickadd',
        label: 'Tambah Dana',
        description: 'Tambah dana ke target',
        icon: 'Plus',
        category: 'create',
        action: () => {
          onOpenQuickAdd();
          close();
        },
        keywords: ['uang', 'money', 'deposit', 'tabung', 'save'],
      },
      {
        id: 'create-wallet',
        label: 'Tambah Wallet',
        description: 'Tambah sumber dana baru',
        icon: 'Plus',
        category: 'create',
        action: () => setCurrentPage('wallet'),
        keywords: ['wallet', 'dompet', 'new', 'baru'],
      },

      // Tools
      {
        id: 'tool-transfer',
        label: 'Transfer Antar Wallet',
        description: 'Pindah dana antar wallet',
        icon: 'ArrowRightLeft',
        category: 'tools',
        action: () => setCurrentPage('wallet'),
        keywords: ['transfer', 'pindah', 'move'],
      },
      {
        id: 'tool-theme-light',
        label: 'Tema Terang',
        description: 'Ganti ke tema terang',
        icon: 'Sun',
        category: 'settings',
        action: () => setTheme('light'),
        keywords: ['light', 'terang', 'bright', 'theme'],
      },
      {
        id: 'tool-theme-dark',
        label: 'Tema Gelap',
        description: 'Ganti ke tema gelap',
        icon: 'Moon',
        category: 'settings',
        action: () => setTheme('dark'),
        keywords: ['dark', 'gelap', 'night', 'theme'],
      },
      {
        id: 'tool-theme-auto',
        label: 'Tema Otomatis',
        description: 'Ikuti sistem',
        icon: 'Globe',
        category: 'settings',
        action: () => setTheme('system'),
        keywords: ['auto', 'otomatis', 'system', 'theme'],
      },

      // Backup
      {
        id: 'backup-export',
        label: 'Export Data',
        description: 'Simpan backup data',
        icon: 'Download',
        category: 'backup',
        action: () => {
          setCurrentPage('settings');
        },
        keywords: ['export', 'backup', 'simpan', 'save'],
      },
      {
        id: 'backup-import',
        label: 'Import Data',
        description: 'Restore dari backup',
        icon: 'Upload',
        category: 'backup',
        action: () => {
          setCurrentPage('settings');
        },
        keywords: ['import', 'restore', 'load', 'muat'],
      },
      {
        id: 'backup-pdf',
        label: 'Export PDF Report',
        description: 'Generate laporan PDF',
        icon: 'FileText',
        category: 'report',
        action: () => {
          setCurrentPage('analytics');
        },
        keywords: ['pdf', 'report', 'laporan', 'document'],
      },
    ];

    // Add dynamic goal commands
    activeGoals.forEach((goal) => {
      commands.push({
        id: `goal-${goal.id}`,
        label: goal.title,
        description: `Target: ${Math.round(goal.progress)}% selesai`,
        icon: 'Target',
        category: 'navigation',
        action: () => setCurrentPage('goals'),
        keywords: [goal.title, goal.category],
      });
    });

    // Add dynamic wallet commands
    wallets.forEach((wallet) => {
      commands.push({
        id: `wallet-${wallet.id}`,
        label: wallet.name,
        description: 'Saldo: ' + wallet.balance.toLocaleString('id-ID'),
        icon: 'Wallet',
        category: 'navigation',
        action: () => setCurrentPage('wallet'),
        keywords: [wallet.name, wallet.type],
      });
    });

    return commands;
  }, [activeGoals, wallets, setCurrentPage, close, onOpenGoalModal, onOpenQuickAdd, setTheme]);

  // Fuzzy search filter
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allCommands;

    const query = searchQuery.toLowerCase();
    return allCommands.filter((cmd) => {
      // Check label
      if (cmd.label.toLowerCase().includes(query)) return true;
      // Check description
      if (cmd.description?.toLowerCase().includes(query)) return true;
      // Check keywords
      if (cmd.keywords?.some((kw) => kw.toLowerCase().includes(query))) return true;
      // Check category
      if (cmd.category.toLowerCase().includes(query)) return true;

      // Fuzzy match - check if characters appear in order
      let queryIndex = 0;
      for (const char of cmd.label.toLowerCase()) {
        if (char === query[queryIndex]) {
          queryIndex++;
          if (queryIndex === query.length) return true;
        }
      }

      return false;
    });
  }, [allCommands, searchQuery]);

  // Sort: favorites first, then recent, then rest
  const sortedCommands = useMemo(() => {
    const favorites = filteredCommands.filter((cmd) => favoriteActions.includes(cmd.id));
    const recents = filteredCommands.filter(
      (cmd) => recentActions.includes(cmd.id) && !favoriteActions.includes(cmd.id)
    );
    const others = filteredCommands.filter(
      (cmd) => !recentActions.includes(cmd.id) && !favoriteActions.includes(cmd.id)
    );

    // Sort recents by order in recentActions
    recents.sort((a, b) => {
      const aIndex = recentActions.indexOf(a.id);
      const bIndex = recentActions.indexOf(b.id);
      return aIndex - bIndex;
    });

    return [...favorites, ...recents, ...others];
  }, [filteredCommands, favoriteActions, recentActions]);

  // Category groups
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};

    sortedCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [sortedCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveSelectionDown(sortedCommands.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveSelectionUp();
          break;
        case 'Enter':
          e.preventDefault();
          if (sortedCommands[selectedIndex]) {
            const cmd = sortedCommands[selectedIndex];
            addToRecent(cmd.id);
            cmd.action();
            close();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            moveSelectionUp();
          } else {
            moveSelectionDown(sortedCommands.length - 1);
          }
          break;
      }
    },
    [sortedCommands, selectedIndex, moveSelectionUp, moveSelectionDown, addToRecent, close]
  );

  const handleSelectCommand = useCallback(
    (cmd: CommandAction) => {
      addToRecent(cmd.id);
      cmd.action();
      close();
    },
    [addToRecent, close]
  );

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Home: <Home className="w-5 h-5" />,
      Target: <Target className="w-5 h-5" />,
      Wallet: <Wallet className="w-5 h-5" />,
      Calendar: <Calendar className="w-5 h-5" />,
      BarChart3: <BarChart3 className="w-5 h-5" />,
      Trophy: <Trophy className="w-5 h-5" />,
      Compass: <Compass className="w-5 h-5" />,
      Sparkles: <Sparkles className="w-5 h-5" />,
      Settings: <Settings className="w-5 h-5" />,
      Plus: <Plus className="w-5 h-5" />,
      Download: <Download className="w-5 h-5" />,
      Upload: <Upload className="w-5 h-5" />,
      FileText: <FileText className="w-5 h-5" />,
      ArrowRightLeft: <ArrowRightLeft className="w-5 h-5" />,
      Sun: <Sun className="w-5 h-5" />,
      Moon: <Moon className="w-5 h-5" />,
      Globe: <Globe className="w-5 h-5" />,
      TrendingUp: <TrendingUp className="w-5 h-5" />,
    };
    return icons[iconName] || <Command className="w-5 h-5" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      navigation: 'Navigasi',
      create: 'Buat Baru',
      edit: 'Edit',
      report: 'Laporan',
      backup: 'Backup',
      tools: 'Alat',
      settings: 'Pengaturan',
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        onClick={close}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Command Center Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <Search className="w-5 h-5 text-base-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari perintah atau halaman..."
              className="flex-1 bg-transparent text-lg text-white placeholder:text-base-400 focus:outline-none"
              aria-label="Search commands"
            />
            <div className="flex items-center gap-1 text-xs text-base-400">
              <kbd className="px-2 py-1 bg-white/5 rounded">ESC</kbd>
              <span>untuk tutup</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {sortedCommands.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-base-400" />
                <p className="text-lg font-medium mb-1">Tidak ada hasil</p>
                <p className="text-sm text-base-400">Coba gunakan kata kunci lain</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <div key={category} className="mb-2">
                    <p className="px-3 py-2 text-xs font-medium text-base-400 uppercase tracking-wider">
                      {getCategoryLabel(category)}
                    </p>
                    {commands.map((cmd, idx) => {
                      const globalIndex = sortedCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      const isFav = isFavorite(cmd.id);

                      return (
                        <motion.button
                          key={cmd.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => handleSelectCommand(cmd)}
                          onMouseEnter={() => useCommandCenterStore.getState().setSelectedIndex(globalIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                            isSelected
                              ? 'bg-primary-500/20 text-white'
                              : 'hover:bg-white/5 text-base-200'
                          )}
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              isSelected ? 'bg-primary-500/30' : 'bg-white/5'
                            )}
                          >
                            {getIconComponent(cmd.icon)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{cmd.label}</p>
                              {isFav && <Star className="w-3 h-3 text-warning fill-warning" />}
                              {recentActions.includes(cmd.id) && !isFav && (
                                <Clock className="w-3 h-3 text-base-400" />
                              )}
                            </div>
                            {cmd.description && (
                              <p className="text-sm text-base-400">{cmd.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {cmd.shortcut && (
                              <kbd className="px-2 py-1 text-xs bg-white/5 rounded text-base-400">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(cmd.id);
                              }}
                              className={cn(
                                'p-1 rounded transition-colors',
                                isFav ? 'text-warning' : 'text-base-400 hover:text-warning'
                              )}
                            >
                              <Star className={cn('w-4 h-4', isFav && 'fill-warning')} />
                            </button>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/2">
            <div className="flex items-center gap-4 text-xs text-base-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd> Navigasi
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Enter</kbd> Pilih
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Tab</kbd> Pindah
              </span>
            </div>
            <span className="text-xs text-base-400">
              {sortedCommands.length} perintah tersedia
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
