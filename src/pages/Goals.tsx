// Goals Page

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Search,
  Grid,
  List,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Pause,
} from 'lucide-react';
import { useGoalStore, useWalletStore } from '../stores';
import { useToast } from '../components/ui/Toast';
import { Goal } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/calculations';
import { GoalModal } from '../modals/GoalModal';
import { QuickAddModal } from '../modals/QuickAddModal';

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'active' | 'completed' | 'paused';

export function GoalsPage() {
  const { activeGoals, loading, fetchActiveGoals, deleteGoal, pauseGoal, resumeGoal } = useGoalStore();
  const { fetchWallets } = useWalletStore();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchActiveGoals();
    fetchWallets();
  }, []);

  const filteredGoals = activeGoals.filter((goal) => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'active' && goal.status === 'active') ||
      (filterMode === 'completed' && goal.status === 'completed') ||
      (filterMode === 'paused' && goal.status === 'paused');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Target Saya</h1>
          <p className="text-base-400 mt-1">Kelola dan pantau semua target finansial Anda</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowGoalModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold
            flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Target Baru
        </motion.button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
            <input
              type="text"
              placeholder="Cari target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface border border-white/5 rounded-xl
                text-sm w-64 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            {(['all', 'active', 'completed', 'paused'] as FilterMode[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterMode(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterMode === filter
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-surface text-base-300 hover:bg-white/5'
                }`}
              >
                {filter === 'all' ? 'Semua' : filter === 'active' ? 'Aktif' : filter === 'completed' ? 'Selesai' : 'Pause'}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-surface rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-base-400'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-white/10 text-white' : 'text-base-400'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Goals Grid/List */}
      {loading ? (
        <GoalsSkeleton viewMode={viewMode} />
      ) : filteredGoals.length === 0 ? (
        <EmptyGoalsState onCreate={() => setShowGoalModal(true)} />
      ) : (
        <AnimatePresence mode="wait">
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredGoals.map((goal, index) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                index={index}
                viewMode={viewMode}
                onAdd={() => {
                  setSelectedGoal(goal);
                  setShowQuickAdd(true);
                }}
                onEdit={() => {
                  setSelectedGoal(goal);
                  setShowGoalModal(true);
                }}
                onPause={async () => {
                  await pauseGoal(goal.id);
                  toast.success('Target Dijeda', `${goal.title} telah dijeda`);
                }}
                onResume={async () => {
                  await resumeGoal(goal.id);
                  toast.success('Target Dilanjutkan', `${goal.title} kembali aktif`);
                }}
                onDelete={async () => {
                  if (confirm(`Hapus target "${goal.title}"?`)) {
                    await deleteGoal(goal.id);
                    toast.success('Target Dihapus', `${goal.title} telah dihapus`);
                  }
                }}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Modals */}
      {showGoalModal && (
        <GoalModal
          goal={selectedGoal}
          onClose={() => {
            setShowGoalModal(false);
            setSelectedGoal(null);
          }}
        />
      )}

      {showQuickAdd && selectedGoal && (
        <QuickAddModal
          goal={selectedGoal}
          onClose={() => {
            setShowQuickAdd(false);
            setSelectedGoal(null);
          }}
        />
      )}
    </div>
  );
}

interface GoalItemProps {
  goal: Goal;
  index: number;
  viewMode: ViewMode;
  onAdd: () => void;
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}

function GoalItem({ goal, index, viewMode, onAdd, onEdit, onPause, onResume, onDelete }: GoalItemProps) {
  const daysRemaining = getDaysRemaining(goal.deadline);
  const progress = goal.progress;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * index }}
        className="bg-surface rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress * 1.25} 125`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{goal.title}</h3>
            <div className="flex items-center gap-4 text-sm text-base-400 mt-1">
              <span>{formatCurrency(goal.targetAmount - goal.remainingAmount)} / {formatCurrency(goal.targetAmount)}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {daysRemaining} hari
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              goal.status === 'active' ? 'bg-success/20 text-success' :
                goal.status === 'completed' ? 'bg-primary-500/20 text-primary-400' :
                  'bg-warning/20 text-warning'
            }`}>
              {goal.status}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="px-4 py-2 bg-primary-500 rounded-xl text-white font-medium"
            >
              Tambah
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index }}
      className="group bg-surface rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all"
    >
      {/* Cover */}
      <div
        className="h-32 bg-gradient-to-br from-primary-500/30 to-accent/30 relative"
        style={{
          backgroundImage: goal.coverImage ? `url(${goal.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
            goal.priority === 'critical' ? 'bg-error/80 text-white' :
              goal.priority === 'high' ? 'bg-warning/80 text-white' :
                'bg-white/20 text-white'
          }`}>
            {goal.priority}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 -mt-8 relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-medium text-primary-400">{goal.category}</span>
            <h3 className="font-semibold mt-1 group-hover:text-primary-400 transition-colors">{goal.title}</h3>
          </div>
          <GoalMenu
            onEdit={onEdit}
            onPause={goal.status === 'active' ? onPause : undefined}
            onResume={goal.status === 'paused' ? onResume : undefined}
            onDelete={onDelete}
          />
        </div>

        <div className="space-y-3">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 1.25} 125`}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-success font-medium">{formatCurrency(goal.targetAmount - goal.remainingAmount)}</span>
                <span className="text-base-400">{formatCurrency(goal.targetAmount)}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-base-400">Harian</p>
              <p className="font-medium">{formatCurrency(goal.dailyTarget)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-base-400">Sisa Hari</p>
              <p className="font-medium">{daysRemaining} hari</p>
            </div>
          </div>

          {/* Add Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="w-full py-2.5 bg-primary-500/20 text-primary-400 rounded-xl font-medium
              hover:bg-primary-500/30 transition-colors"
          >
            Tambah Dana
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function GoalMenu({
  onEdit,
  onPause,
  onResume,
  onDelete,
}: {
  onEdit: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 bg-surface border border-white/10 rounded-xl p-1 min-w-[120px] z-10"
          >
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            {onPause && (
              <button
                onClick={() => {
                  setOpen(false);
                  onPause();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-base-400"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}
            {onResume && (
              <button
                onClick={() => {
                  setOpen(false);
                  onResume();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-success"
              >
                <Clock className="w-4 h-4" /> Lanjutkan
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-error"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyGoalsState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center">
        <Target className="w-12 h-12 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Belum Ada Target</h3>
      <p className="text-base-400 max-w-md mx-auto mb-6">
        Mulai perjalanan finansial Anda dengan membuat target pertama. Setiap impian dimulai dari satu langkah kecil.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreate}
        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold"
      >
        Buat Target Pertama
      </motion.button>
    </motion.div>
  );
}

function GoalsSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
      }
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="skeleton h-64 rounded-2xl" />
      ))}
    </div>
  );
}
