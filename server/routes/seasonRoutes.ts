import { Router, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get Seasons (optional filter by serial_id)
router.get('/', async (req, res) => {
  try {
    const serial_id = req.query.serial_id ? parseInt(req.query.serial_id as string) : null;
    let sql = `SELECT s.*, ser.title as serial_title,
      (SELECT COUNT(*) FROM episodes WHERE season_id = s.id) as total_episodes
      FROM seasons s
      JOIN serials ser ON s.serial_id = ser.id`;
    let params: any[] = [];

    if (serial_id) {
      sql += ' WHERE s.serial_id = ?';
      params.push(serial_id);
    }

    sql += ' ORDER BY s.serial_id ASC, s.season_number ASC';

    const seasons = await dbAll(sql, params);
    return res.json({ success: true, data: seasons });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving seasons', error: err.message });
  }
});

// Get single season
router.get('/:id', async (req, res) => {
  try {
    const season = await dbGet('SELECT s.*, ser.title as serial_title FROM seasons s JOIN serials ser ON s.serial_id = ser.id WHERE s.id = ?', [req.params.id]);
    if (!season) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    const episodes = await dbAll('SELECT * FROM episodes WHERE season_id = ? ORDER BY episode_number ASC', [season.id]);
    return res.json({ success: true, data: { ...season, episodes } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching season', error: err.message });
  }
});

// Create Season
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { serial_id, season_number, title, description, poster, release_date, status } = req.body;

    if (!serial_id || !season_number || !title) {
      return res.status(400).json({ success: false, message: 'Serial ID, season number, and title are required.' });
    }

    const serialExists = await dbGet('SELECT id FROM serials WHERE id = ?', [serial_id]);
    if (!serialExists) {
      return res.status(404).json({ success: false, message: 'Associated Serial not found.' });
    }

    const result = await dbRun(
      `INSERT INTO seasons (serial_id, season_number, title, description, poster, release_date, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        serial_id,
        season_number,
        title,
        description || '',
        poster || '',
        release_date || null,
        status || 'published',
      ]
    );

    await logActivity(req, req.user!.id, 'CREATE_SEASON', 'season', result.lastID, `Created Season ${season_number} for Serial #${serial_id}`);

    const newSeason = await dbGet('SELECT * FROM seasons WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Season created successfully', data: newSeason });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating season', error: err.message });
  }
});

// Update Season
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = parseInt(req.params.id);
    const season = await dbGet('SELECT * FROM seasons WHERE id = ?', [seasonId]);
    if (!season) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    const { season_number, title, description, poster, release_date, status } = req.body;

    await dbRun(
      `UPDATE seasons SET
        season_number = ?,
        title = ?,
        description = ?,
        poster = ?,
        release_date = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        season_number !== undefined ? season_number : season.season_number,
        title || season.title,
        description !== undefined ? description : season.description,
        poster !== undefined ? poster : season.poster,
        release_date !== undefined ? release_date : season.release_date,
        status !== undefined ? status : season.status,
        seasonId,
      ]
    );

    await logActivity(req, req.user!.id, 'UPDATE_SEASON', 'season', seasonId, `Updated Season #${seasonId}`);

    const updated = await dbGet('SELECT * FROM seasons WHERE id = ?', [seasonId]);
    return res.json({ success: true, message: 'Season updated successfully', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating season', error: err.message });
  }
});

// Delete Season
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = parseInt(req.params.id);
    const season = await dbGet('SELECT title FROM seasons WHERE id = ?', [seasonId]);
    if (!season) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    await dbRun('DELETE FROM seasons WHERE id = ?', [seasonId]);
    await logActivity(req, req.user!.id, 'DELETE_SEASON', 'season', seasonId, `Deleted season "${season.title}"`);

    return res.json({ success: true, message: 'Season deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting season', error: err.message });
  }
});

export default router;
