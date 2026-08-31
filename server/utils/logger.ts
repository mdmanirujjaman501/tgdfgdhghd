import { dbRun } from '../db';
import { Request } from 'express';

export async function logActivity(
  req: Request,
  adminId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  description: string
) {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await dbRun(
      `INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, action, entityType, entityId, description, ipAddress, userAgent]
    );
  } catch (err) {
    console.error('[Logger] Failed to record activity log:', err);
  }
}
