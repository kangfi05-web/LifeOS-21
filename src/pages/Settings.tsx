// Settings Page

import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Globe, Palette, Save } from 'lucide-react';
import { useTheme } from '../design-system';
import { useState } from 'react';
import { RecoveryCenter } from '../components/RecoveryCenter';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('IDR');
  const [language, setLanguage] = useState('id');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary-400" />
          Pengaturan
        </h1>
        <p className="text-base-400 mt-1">Kelola preferensi aplikasi Anda</p>
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Tampilan</h2>
            <p className="text-sm text-base-400">Sesuaikan tampilan aplikasi</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm text-base-400 mb-3">Tema</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium">Terang</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm font-medium">Gelap</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'system'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <Globe className="w-6 h-6" />
                <span className="text-sm font-medium">Otomatis</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Notifikasi</h2>
            <p className="text-sm text-base-400">Atur preferensi notifikasi</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Enable Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aktifkan Notifikasi</p>
              <p className="text-sm text-base-400">Terima pengingat dan update</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-8 rounded-full transition-all relative ${
                notifications ? 'bg-success' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
                  notifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Daily Reminder */}
          {notifications && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="font-medium">Pengingat Harian</p>
                <p className="text-sm text-base-400">Ingatkan untuk menabung setiap hari</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm">
                <option value="09:00">09:00</option>
                <option value="12:00">12:00</option>
                <option value="18:00">18:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>
          )}
        </div>
      </motion.div>

      {/* Regional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Regional</h2>
            <p className="text-sm text-base-400">Pengaturan bahasa dan mata uang</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Currency */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mata Uang</p>
              <p className="text-sm text-base-400">Mata uang default</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
            >
              <option value="IDR">IDR - Rupiah</option>
              <option value="USD">USD - Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="font-medium">Bahasa</p>
              <p className="text-sm text-base-400">Bahasa antarmuka</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Recovery Center */}
      <RecoveryCenter />

      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold text-white flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Simpan Pengaturan
      </motion.button>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-6 text-base-400 text-sm"
      >
        <p className="font-semibold text-white">LifeOS</p>
        <p className="mt-1">Personal Financial Operating System</p>
        <p className="mt-2">Version 1.15.0</p>
      </motion.div>
    </div>
  );
}
