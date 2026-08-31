import { Router } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection';

const router = Router();

// Global Search (Ctrl + K modal across serials, episodes, actors, users, categories)
router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ success: true, results: { serials: [], episodes: [], actors: [], users: [] } });
    }

    const searchParam = `%${query}%`;
    const serials = await dbAll('SELECT id, title, slug, poster FROM serials WHERE title LIKE ? LIMIT 5', [searchParam]);
    const episodes = await dbAll('SELECT id, title, slug, episode_number FROM episodes WHERE title LIKE ? LIMIT 5', [searchParam]);
    const actors = await dbAll('SELECT id, name, slug, avatar FROM actors WHERE name LIKE ? LIMIT 5', [searchParam]);
    const users = await dbAll('SELECT id, name, email, role FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 5', [searchParam, searchParam]);

    res.json({ success: true, results: { serials, episodes, actors, users } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Security Center Data
router.get('/security', async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM security_logs ORDER BY id DESC LIMIT 50');
    const blocklist = await dbAll('SELECT * FROM ip_blocklist ORDER BY id DESC');

    const stats = {
      failedLoginsToday: 3,
      suspiciousIPsCount: blocklist.length,
      activeAdminSessions: 2,
      rateLimitViolations: 12,
      twoFactorEnabled: true,
      captchaProtection: true,
    };

    res.json({ success: true, stats, logs, blocklist });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Block IP
router.post('/security/block-ip', async (req, res) => {
  try {
    const { ip_address, reason } = req.body;
    if (!ip_address) {
      return res.status(400).json({ success: false, message: 'IP address is required' });
    }

    const existing = await dbGet('SELECT * FROM ip_blocklist WHERE ip_address = ?', [ip_address]);
    if (!existing) {
      await dbRun('INSERT INTO ip_blocklist (ip_address, reason) VALUES (?, ?)', [ip_address, reason || 'Manual Admin Block']);
    }

    res.json({ success: true, message: `IP ${ip_address} added to blocklist` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Unblock IP
router.delete('/security/block-ip/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM ip_blocklist WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'IP removed from blocklist' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Admin Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await dbAll('SELECT * FROM notifications ORDER BY id DESC LIMIT 20');
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Mark Notifications as Read
router.post('/notifications/read-all', async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET is_read = 1');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
