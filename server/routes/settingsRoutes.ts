import { Router, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get settings as object key-value pair
router.get('/', async (req, res) => {
  try {
    const rows = await dbAll('SELECT setting_key, setting_value FROM settings');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    return res.json({ success: true, data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching settings', error: err.message });
  }
});

// Update settings
router.put('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const newSettings = req.body; // Key-value map
    if (typeof newSettings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload format' });
    }

    for (const [key, value] of Object.entries(newSettings)) {
      const stringValue = String(value);
      const existing = await dbGet('SELECT setting_key FROM settings WHERE setting_key = ?', [key]);
      if (existing) {
        await dbRun('UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [stringValue, key]);
      } else {
        await dbRun('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, stringValue]);
      }
    }

    await logActivity(req, req.user!.id, 'UPDATE_SETTINGS', 'settings', null, 'Updated system settings');

    return res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating settings', error: err.message });
  }
});

export default router;
