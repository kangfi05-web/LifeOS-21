// Dream Universe Page - Visual Planet View

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Search, ZoomIn, ZoomOut, Star } from 'lucide-react';
import { useGoalStore } from '../stores';
import { Goal } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { GOAL_CATEGORIES } from '../constants';

interface Planet {
  id: string;
  x: number;
  y: number;
  size: number;
  goal: Goal;
  color: string;
  progress: number;
}

export function DreamUniversePage() {
  const { activeGoals, fetchActiveGoals } = useGoalStore();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActiveGoals();
  }, []);

  useEffect(() => {
    if (activeGoals.length > 0) {
      generatePlanets();
    }
  }, [activeGoals]);

  const generatePlanets = () => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const newPlanets: Planet[] = activeGoals.map((goal, index) => {
      const angle = (index / activeGoals.length) * Math.PI * 2;
      const distance = 100 + (goal.targetAmount / 10000000) * 200 + Math.random() * 100;
      const x = centerX + Math.cos(angle) * distance * Math.min(1, Math.random() * 0.5 + 0.5);
      const y = centerY + Math.sin(angle) * distance * Math.min(1, Math.random() * 0.5 + 0.5);

      const size = 40 + (goal.targetAmount / 100000000) * 80 + 20;
      const color = goal.color || GOAL_CATEGORIES[goal.category]?.color || '#3B82F6';

      return {
        id: goal.id,
        x,
        y,
        size: Math.min(size, 120),
        goal,
        color,
        progress: goal.progress,
      };
    });

    setPlanets(newPlanets);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary-400" />
            Dream Universe
          </h1>
          <p className="text-base-400 mt-1">Jelajahi galaksi impian Anda</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
            <input
              type="text"
              placeholder="Cari planet..."
              className="pl-10 pr-4 py-2 bg-surface border border-white/5 rounded-xl text-sm w-48 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          {/* Zoom Controls */}
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            className="p-2 bg-surface rounded-xl hover:bg-white/5"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-2 bg-surface rounded-xl hover:bg-white/5"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Universe Container */}
      <div
        ref={containerRef}
        className="flex-1 relative rounded-2xl border border-white/5 overflow-hidden bg-base-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Nebula Effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        {/* Planets Container */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
        >
          {planets.map((planet) => (
            <PlanetComponent
              key={planet.id}
              planet={planet}
              isSelected={selectedPlanet?.id === planet.id}
              onClick={() => setSelectedPlanet(selectedPlanet?.id === planet.id ? null : planet)}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {planets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Semesta Anda Masih Kosong</h3>
              <p className="text-base-400 max-w-md mx-auto">
                Buat target pertama Anda dan lihat galaksi impian mulai bersinar.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Selected Planet Info */}
      {selectedPlanet && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-6 top-44 w-80 bg-surface rounded-2xl border border-white/5 p-6 z-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: selectedPlanet.color + '30' }}
            >
              <Target className="w-6 h-6" style={{ color: selectedPlanet.color }} />
            </div>
            <div>
              <h3 className="font-semibold">{selectedPlanet.goal.title}</h3>
              <span className="text-xs text-base-400 capitalize">{selectedPlanet.goal.category}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-base-400">Progress</span>
              <span className="font-semibold">{Math.round(selectedPlanet.progress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${selectedPlanet.progress}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: selectedPlanet.color }}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-base-400">Terkumpul</span>
              <span className="text-success">{formatCurrency(selectedPlanet.goal.targetAmount - selectedPlanet.goal.remainingAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-400">Target</span>
              <span>{formatCurrency(selectedPlanet.goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-400">Deadline</span>
              <span>{formatDate(selectedPlanet.goal.deadline, 'd MMM yyyy')}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PlanetComponent({ planet, isSelected, onClick }: { planet: Planet; isSelected: boolean; onClick: () => void }) {
  const { goal, size, color, progress } = planet;

  // Glow intensity based on progress
  const glowOpacity = 0.1 + (progress / 100) * 0.4;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className="absolute cursor-pointer group"
      style={{
        left: planet.x - size / 2,
        top: planet.y - size / 2,
        width: size,
        height: size,
      }}
    >
      {/* Orbit Ring */}
      <div
        className="absolute inset-[-10px] rounded-full border border-white/10"
        style={{
          opacity: progress >= 75 ? 1 : 0.2,
        }}
      />

      {/* Glow Effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl transition-opacity"
        style={{
          backgroundColor: color,
          opacity: glowOpacity,
        }}
      />

      {/* Planet Body */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}20, ${color}`,
          boxShadow: isSelected
            ? `0 0 40px ${color}`
            : `0 0 20px ${color}`,
        }}
      >
        {/* Atmosphere based on progress */}
        {progress >= 25 && (
          <div className="absolute inset-[2px] rounded-full border border-white/10" />
        )}
        {progress >= 50 && (
          <div className="absolute inset-[4px] rounded-full border border-white/5" />
        )}
        {progress >= 75 && (
          <div
            className="absolute inset-[-4px] rounded-full border-2 blur-sm"
            style={{ borderColor: color }}
          />
        )}
        {progress >= 100 && (
          <Star className="absolute top-1 right-1 w-4 h-4 text-amber-400" />
        )}

        {/* Progress Indicator */}
        <div className="absolute inset-2">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.5} 250`}
              style={{ opacity: 0.8 }}
            />
          </svg>
        </div>

        {/* Percentage */}
        <span className="relative z-10 text-sm font-bold text-white drop-shadow-lg">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Hover Label */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
          text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-base-950/80 px-2 py-1 rounded"
      >
        {goal.title}
      </div>
    </motion.div>
  );
}
