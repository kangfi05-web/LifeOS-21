// Analytics Page

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Wallet, Flame, Trophy } from 'lucide-react';
import { useDashboardStore } from '../stores';
import { formatCurrency } from '../utils/calculations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockWeeklyData = [
  { name: 'Sen', amount: 125000 },
  { name: 'Sel', amount: 85000 },
  { name: 'Rab', amount: 150000 },
  { name: 'Kam', amount: 45000 },
  { name: 'Jum', amount: 100000 },
  { name: 'Sab', amount: 75000 },
  { name: 'Min', amount: 120000 },
];

const mockCategoryData = [
  { name: 'Rumah', value: 45, color: '#3B82F6' },
  { name: 'Mobil', value: 25, color: '#F59E0B' },
  { name: 'Liburan', value: 15, color: '#06B6D4' },
  { name: 'Dana Darurat', value: 15, color: '#10B981' },
];

export function AnalyticsPage() {
  const { summary } = useDashboardStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Statistik & Analitik</h1>
        <p className="text-base-400 mt-1">Pantau performa finansial Anda</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Target Aktif"
          value={summary?.activeGoals?.toString() || '0'}
          trend="up"
          trendValue="12%"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Wallet}
          label="Total Terkumpul"
          value={formatCurrency(summary?.totalCollected || 0)}
          trend="up"
          trendValue="18%"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value="7 hari"
          trend="up"
          trendValue="2 hari"
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={Trophy}
          label="Achievement"
          value="12"
          trend="up"
          trendValue="3 baru"
          color="from-purple-500 to-violet-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Progress Mingguan</h3>
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+15%</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeeklyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: unknown) => [formatCurrency(typeof value === 'number' ? value : 0), 'Dana']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Distribusi Target</h3>

          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-3">
              {mockCategoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Skor Kesehatan Finansial</h3>
            <p className="text-base-400 mt-1">Berdasarkan konsistensi dan progress Anda</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-success">78</div>
            <span className="text-sm text-base-400">dari 100</span>
          </div>
        </div>

        <div className="mt-6 h-4 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full"
          />
        </div>

        <div className="flex justify-between mt-4 text-sm text-base-400">
          <span>Critical</span>
          <span>Warning</span>
          <span>Healthy</span>
          <span>Excellent</span>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, trend, trendValue, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-surface rounded-2xl border border-white/5 p-4"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-base-400">{label}</p>
      </div>
    </motion.div>
  );
}
