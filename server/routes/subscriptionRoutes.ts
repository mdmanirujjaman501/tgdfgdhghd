import { Router } from 'express';
import { dbAll, dbGet, dbRun } from '../db/connection';

const router = Router();

// GET Subscription Plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await dbAll('SELECT * FROM subscription_plans ORDER BY id ASC');
    res.json({ success: true, plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Create/Update Subscription Plan
router.post('/plans', async (req, res) => {
  try {
    const { id, name, price, currency, duration, features_json, ad_free, hd_streaming, downloads_allowed, status } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Plan name and price are required' });
    }

    const feats = typeof features_json === 'string' ? features_json : JSON.stringify(features_json || []);

    if (id) {
      await dbRun(
        `UPDATE subscription_plans SET name = ?, price = ?, currency = ?, duration = ?, features_json = ?, ad_free = ?, hd_streaming = ?, downloads_allowed = ?, status = ? WHERE id = ?`,
        [name, price, currency || 'USD', duration || 'Monthly', feats, ad_free ? 1 : 0, hd_streaming ? 1 : 0, downloads_allowed ? 1 : 0, status || 'active', id]
      );
      res.json({ success: true, message: 'Subscription plan updated' });
    } else {
      const result = await dbRun(
        `INSERT INTO subscription_plans (name, price, currency, duration, features_json, ad_free, hd_streaming, downloads_allowed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, price, currency || 'USD', duration || 'Monthly', feats, ad_free ? 1 : 0, hd_streaming ? 1 : 0, downloads_allowed ? 1 : 0, status || 'active']
      );
      res.json({ success: true, message: 'Subscription plan created', id: result.lastID });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Subscription Plan
router.delete('/plans/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM subscription_plans WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Payment Gateways
router.get('/gateways', async (req, res) => {
  try {
    const gateways = await dbAll('SELECT * FROM payment_gateways ORDER BY id ASC');
    res.json({ success: true, gateways });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Update Payment Gateway Status or Config
router.post('/gateways', async (req, res) => {
  try {
    const { gateway_code, is_enabled, mode, config_json } = req.body;
    if (!gateway_code) {
      return res.status(400).json({ success: false, message: 'Gateway code is required' });
    }

    const conf = typeof config_json === 'string' ? config_json : JSON.stringify(config_json || {});

    await dbRun(
      'UPDATE payment_gateways SET is_enabled = ?, mode = ?, config_json = ? WHERE gateway_code = ?',
      [is_enabled ? 1 : 0, mode || 'sandbox', conf, gateway_code]
    );

    res.json({ success: true, message: 'Payment gateway configuration updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Transactions List
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await dbAll(`
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
    res.json({ success: true, transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Process Transaction (or Refund/Cancel)
router.post('/transactions/status', async (req, res) => {
  try {
    const { transaction_id, status } = req.body;
    if (!transaction_id || !status) {
      return res.status(400).json({ success: false, message: 'Transaction ID and status are required' });
    }

    await dbRun('UPDATE transactions SET status = ? WHERE id = ?', [status, transaction_id]);
    res.json({ success: true, message: `Transaction status changed to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
