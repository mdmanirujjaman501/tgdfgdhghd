import { Router, Response } from 'express';
import crypto from 'crypto';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get all API keys
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const keys = await dbAll('SELECT * FROM api_keys ORDER BY created_at DESC');
    return res.json({ success: true, data: keys });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching API keys', error: err.message });
  }
});

// Generate new API key
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, rate_limit } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Key name is required' });

    const key_value = 'sk_live_' + crypto.randomBytes(18).toString('hex');
    const limit = rate_limit ? parseInt(rate_limit) : 1000;

    const result = await dbRun(
      `INSERT INTO api_keys (name, key_value, rate_limit, status, usage_count) VALUES (?, ?, ?, 'active', 0)`,
      [name, key_value, limit]
    );

    await logActivity(req, req.user!.id, 'CREATE_API_KEY', 'api_key', result.lastID, `Generated API Key "${name}"`);

    const newKey = await dbGet('SELECT * FROM api_keys WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'API key generated successfully', data: newKey });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error generating API key', error: err.message });
  }
});

// Update API key status or rate limit
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const keyId = parseInt(req.params.id);
    const { name, rate_limit, status } = req.body;

    const keyRecord = await dbGet('SELECT * FROM api_keys WHERE id = ?', [keyId]);
    if (!keyRecord) return res.status(404).json({ success: false, message: 'API key not found' });

    await dbRun(
      `UPDATE api_keys SET name = ?, rate_limit = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name || keyRecord.name, rate_limit || keyRecord.rate_limit, status || keyRecord.status, keyId]
    );

    await logActivity(req, req.user!.id, 'UPDATE_API_KEY', 'api_key', keyId, `Updated API Key #${keyId}`);

    return res.json({ success: true, message: 'API key updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating API key', error: err.message });
  }
});

// Delete or Revoke API key
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const keyId = parseInt(req.params.id);
    await dbRun('DELETE FROM api_keys WHERE id = ?', [keyId]);
    await logActivity(req, req.user!.id, 'REVOKE_API_KEY', 'api_key', keyId, `Revoked & deleted API key #${keyId}`);
    return res.json({ success: true, message: 'API key revoked successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error revoking API key', error: err.message });
  }
});

export default router;
