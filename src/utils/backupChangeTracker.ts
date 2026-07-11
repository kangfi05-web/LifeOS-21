// Backup Change Tracker — mendengarkan SEMUA event perubahan data (via EventBus yang
// sudah ada) untuk menghitung "berapa banyak perubahan sejak backup terakhir".
// Dipakai oleh Smart Reminder & Backup Health Score di Recovery Center.
//
// Cukup dipanggil sekali (lihat AppStore.initialize) — setelah itu otomatis jalan
// di background setiap ada goal/wallet/transaksi/dll yang berubah.

import { eventBus } from './EventBus';
import { EventType } from '../types';
import { incrementChangeCounter } from './backupExport';

const TRACKED_EVENTS: EventType[] = [
  'goal_created',
  'goal_updated',
  'goal_completed',
  'goal_deleted',
  'saving_added',
  'saving_deleted',
  'wallet_created',
  'wallet_updated',
  'wallet_transfer',
  'journey_created',
];

let started = false;

export function startBackupChangeTracker(): void {
  if (started) return;
  started = true;

  for (const eventType of TRACKED_EVENTS) {
    eventBus.subscribe(eventType, () => {
      incrementChangeCounter().catch(() => {
        // Kegagalan mencatat counter tidak boleh mengganggu operasi utama user
      });
    });
  }
}
