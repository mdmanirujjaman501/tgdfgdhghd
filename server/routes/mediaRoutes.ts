import { Router, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get Media Sources for an Episode (or all)
router.get('/', async (req, res) => {
  try {
    const episode_id = req.query.episode_id ? parseInt(req.query.episode_id as string) : null;
    let sql = `SELECT m.*, e.title as episode_title, e.episode_number, ser.title as serial_title
               FROM media_sources m
               JOIN episodes e ON m.episode_id = e.id
               JOIN serials ser ON e.serial_id = ser.id`;
    let params: any[] = [];

    if (episode_id) {
      sql += ' WHERE m.episode_id = ?';
      params.push(episode_id);
    }

    sql += ' ORDER BY m.id DESC';

    const sources = await dbAll(sql, params);
    return res.json({ success: true, data: sources });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching media sources', error: err.message });
  }
});

// Create Media Source
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { episode_id, type, quality, label, url, file_size, server, status } = req.body;

    if (!episode_id || !label || !url) {
      return res.status(400).json({ success: false, message: 'Episode ID, Label, and URL are required.' });
    }

    const episode = await dbGet('SELECT id FROM episodes WHERE id = ?', [episode_id]);
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found.' });
    }

    const result = await dbRun(
      `INSERT INTO media_sources (episode_id, type, quality, label, url, file_size, server, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        episode_id,
        type || 'stream',
        quality || '720p',
        label,
        url,
        file_size || '',
        server || 'Main Server',
        status || 'active',
      ]
    );

    await logActivity(req, req.user!.id, 'CREATE_MEDIA_SOURCE', 'media_source', result.lastID, `Added media source "${label}" for episode #${episode_id}`);

    const newSource = await dbGet('SELECT * FROM media_sources WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Media source added successfully', data: newSource });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating media source', error: err.message });
  }
});

// Update Media Source
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const mediaId = parseInt(req.params.id);
    const existing = await dbGet('SELECT * FROM media_sources WHERE id = ?', [mediaId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Media source not found.' });
    }

    const { type, quality, label, url, file_size, server, status } = req.body;

    await dbRun(
      `UPDATE media_sources SET
        type = ?,
        quality = ?,
        label = ?,
        url = ?,
        file_size = ?,
        server = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        type || existing.type,
        quality || existing.quality,
        label || existing.label,
        url || existing.url,
        file_size !== undefined ? file_size : existing.file_size,
        server || existing.server,
        status || existing.status,
        mediaId,
      ]
    );

    await logActivity(req, req.user!.id, 'UPDATE_MEDIA_SOURCE', 'media_source', mediaId, `Updated media source #${mediaId}`);

    const updated = await dbGet('SELECT * FROM media_sources WHERE id = ?', [mediaId]);
    return res.json({ success: true, message: 'Media source updated successfully', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating media source', error: err.message });
  }
});

// Delete Media Source
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const mediaId = parseInt(req.params.id);
    await dbRun('DELETE FROM media_sources WHERE id = ?', [mediaId]);
    await logActivity(req, req.user!.id, 'DELETE_MEDIA_SOURCE', 'media_source', mediaId, `Deleted media source #${mediaId}`);
    return res.json({ success: true, message: 'Media source deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting media source', error: err.message });
  }
});

export default router;
