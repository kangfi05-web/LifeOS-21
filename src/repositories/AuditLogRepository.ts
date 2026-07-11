// Audit Log Repository — mencatat riwayat backup, restore, import, export

import { db, generateId } from '../database';
import { AuditLogEntry } from '../types';

export class AuditLogRepository {
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date(),
    };
    await db.auditLog.add(newEntry);
    return newEntry;
  }

  async getRecent(limit: number = 20): Promise<AuditLogEntry[]> {
    return await db.auditLog.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  async getAll(): Promise<AuditLogEntry[]> {
    return await db.auditLog.orderBy('timestamp').reverse().toArray();
  }
}

export const auditLogRepository = new AuditLogRepository();
