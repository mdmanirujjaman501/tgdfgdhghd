import { Router } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection';

const router = Router();

// GET all monetization settings as key-value map
router.get('/settings', async (req, res) => {
  try {
    const rows = await dbAll('SELECT setting_key, setting_value FROM monetization_settings');
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value || '';
    });
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST update monetization settings
router.post('/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings object' });
    }

    for (const [key, value] of Object.entries(settings)) {
      const valStr = String(value);
      const existing = await dbGet('SELECT setting_key FROM monetization_settings WHERE setting_key = ?', [key]);
      if (existing) {
        await dbRun('UPDATE monetization_settings SET setting_value = ? WHERE setting_key = ?', [valStr, key]);
      } else {
        await dbRun('INSERT INTO monetization_settings (setting_key, setting_value) VALUES (?, ?)', [key, valStr]);
      }
    }

    res.json({ success: true, message: 'Monetization settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Ad Units
router.get('/units', async (req, res) => {
  try {
    const units = await dbAll('SELECT * FROM ad_units ORDER BY id DESC');
    res.json({ success: true, units });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create/update Ad Unit
router.post('/units', async (req, res) => {
  try {
    const { id, network, name, slot_id, format, size, status } = req.body;
    if (!network || !name || !slot_id) {
      return res.status(400).json({ success: false, message: 'Missing required ad unit fields' });
    }

    if (id) {
      await dbRun(
        'UPDATE ad_units SET network = ?, name = ?, slot_id = ?, format = ?, size = ?, status = ? WHERE id = ?',
        [network, name, slot_id, format || 'Display', size || 'Responsive', status || 'active', id]
      );
      res.json({ success: true, message: 'Ad unit updated' });
    } else {
      const result = await dbRun(
        'INSERT INTO ad_units (network, name, slot_id, format, size, status) VALUES (?, ?, ?, ?, ?, ?)',
        [network, name, slot_id, format || 'Display', size || 'Responsive', status || 'active']
      );
      res.json({ success: true, message: 'Ad unit created', id: result.lastID });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Ad Unit
router.delete('/units/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM ad_units WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ad unit deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Ad Placements
router.get('/placements', async (req, res) => {
  try {
    const placements = await dbAll(`
      SELECT p.*, u.name as unit_name, u.slot_id as unit_slot_id
      FROM ad_placements p
      LEFT JOIN ad_units u ON p.ad_unit_id = u.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, placements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create/update Ad Placement
router.post('/placements', async (req, res) => {
  try {
    const { id, name, position, network, ad_unit_id, fallback_network, device_target, priority, status } = req.body;
    if (!name || !position) {
      return res.status(400).json({ success: false, message: 'Placement name and position are required' });
    }

    if (id) {
      await dbRun(
        `UPDATE ad_placements SET name = ?, position = ?, network = ?, ad_unit_id = ?, fallback_network = ?, device_target = ?, priority = ?, status = ? WHERE id = ?`,
        [name, position, network || 'AdSense', ad_unit_id || null, fallback_network || 'Google Ad Manager', device_target || 'All', priority || 1, status || 'active', id]
      );
      res.json({ success: true, message: 'Ad placement updated' });
    } else {
      const result = await dbRun(
        `INSERT INTO ad_placements (name, position, network, ad_unit_id, fallback_network, device_target, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, position, network || 'AdSense', ad_unit_id || null, fallback_network || 'Google Ad Manager', device_target || 'All', priority || 1, status || 'active']
      );
      res.json({ success: true, message: 'Ad placement created', id: result.lastID });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Ad Placement
router.delete('/placements/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM ad_placements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ad placement deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Ad Analytics & Revenue Dashboard Data
router.get('/analytics', async (req, res) => {
  try {
    const geoData = await dbAll('SELECT * FROM ad_analytics ORDER BY revenue DESC');
    const deviceData = [
      { device: 'Desktop', users: 48500, sessions: 124000, impressions: 320000, clicks: 9800, revenue: 1450.80, ctr: 3.06, rpm: 4.53 },
      { device: 'Mobile', users: 62000, sessions: 189000, impressions: 450000, clicks: 14200, revenue: 1890.40, ctr: 3.15, rpm: 4.20 },
      { device: 'Tablet', users: 12400, sessions: 28000, impressions: 72000, clicks: 2100, revenue: 290.50, ctr: 2.91, rpm: 4.03 },
    ];

    const revenueSummary = {
      estimatedRevenue: 3631.70,
      todayRevenue: 245.80,
      yesterdayRevenue: 210.40,
      thisMonthRevenue: 5820.50,
      lastMonthRevenue: 4910.00,
      rpm: 12.45,
      cpm: 11.80,
      cpc: 0.38,
      ctr: 3.12,
      impressions: 842000,
      clicks: 26100,
      fillRate: 98.4,
    };

    res.json({ success: true, revenueSummary, geoData, deviceData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
