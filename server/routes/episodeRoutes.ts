import { Router, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Get Episodes with pagination, search & filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const serial_id = req.query.serial_id ? parseInt(req.query.serial_id as string) : null;
    const season_id = req.query.season_id ? parseInt(req.query.season_id as string) : null;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status as string;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (serial_id) {
      whereConditions.push('e.serial_id = ?');
      params.push(serial_id);
    }

    if (season_id) {
      whereConditions.push('e.season_id = ?');
      params.push(season_id);
    }

    if (status) {
      whereConditions.push('e.status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(e.title LIKE ? OR e.description LIKE ?)');
      params.push(search, search);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await dbGet<{ total: number }>(`SELECT COUNT(*) as total FROM episodes e ${whereClause}`, params);
    const total = countResult ? countResult.total : 0;

    const episodes = await dbAll(
      `SELECT e.*, ser.title as serial_title, s.season_number, s.title as season_title,
        (SELECT COUNT(*) FROM media_sources WHERE episode_id = e.id) as media_sources_count
       FROM episodes e
       JOIN serials ser ON e.serial_id = ser.id
       JOIN seasons s ON e.season_id = s.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      success: true,
      message: 'Episodes retrieved successfully',
      data: episodes,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching episodes', error: err.message });
  }
});

// Get single episode details with media sources
router.get('/:id', async (req, res) => {
  try {
    const episode = await dbGet(
      `SELECT e.*, ser.title as serial_title, s.season_number
       FROM episodes e
       JOIN serials ser ON e.serial_id = ser.id
       JOIN seasons s ON e.season_id = s.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    const mediaSources = await dbAll('SELECT * FROM media_sources WHERE episode_id = ? ORDER BY id ASC', [episode.id]);

    return res.json({
      success: true,
      data: {
        ...episode,
        media_sources: mediaSources,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching episode', error: err.message });
  }
});

// Create Episode
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      serial_id,
      season_id,
      episode_number,
      title,
      description,
      thumbnail,
      video_url,
      duration,
      release_date,
      status,
      featured,
    } = req.body;

    if (!serial_id || !season_id || !episode_number || !title) {
      return res.status(400).json({ success: false, message: 'Serial ID, Season ID, Episode Number, and Title are required.' });
    }

    let slug = slugify(title);

    const result = await dbRun(
      `INSERT INTO episodes 
       (serial_id, season_id, episode_number, title, slug, description, thumbnail, video_url, duration, release_date, status, featured, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        serial_id,
        season_id,
        episode_number,
        title,
        slug,
        description || '',
        thumbnail || '',
        video_url || '',
        duration || '45 mins',
        release_date || null,
        status || 'published',
        featured ? 1 : 0,
      ]
    );

    await logActivity(req, req.user!.id, 'CREATE_EPISODE', 'episode', result.lastID, `Created Episode ${episode_number}: ${title}`);

    const newEp = await dbGet('SELECT * FROM episodes WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Episode created successfully', data: newEp });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating episode', error: err.message });
  }
});

// Update Episode
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const epId = parseInt(req.params.id);
    const episode = await dbGet('SELECT * FROM episodes WHERE id = ?', [epId]);
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    const {
      serial_id,
      season_id,
      episode_number,
      title,
      description,
      thumbnail,
      video_url,
      duration,
      release_date,
      status,
      featured,
    } = req.body;

    const newTitle = title || episode.title;
    const slug = title && title !== episode.title ? slugify(title) : episode.slug;

    await dbRun(
      `UPDATE episodes SET
        serial_id = ?,
        season_id = ?,
        episode_number = ?,
        title = ?,
        slug = ?,
        description = ?,
        thumbnail = ?,
        video_url = ?,
        duration = ?,
        release_date = ?,
        status = ?,
        featured = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        serial_id !== undefined ? serial_id : episode.serial_id,
        season_id !== undefined ? season_id : episode.season_id,
        episode_number !== undefined ? episode_number : episode.episode_number,
        newTitle,
        slug,
        description !== undefined ? description : episode.description,
        thumbnail !== undefined ? thumbnail : episode.thumbnail,
        video_url !== undefined ? video_url : episode.video_url,
        duration !== undefined ? duration : episode.duration,
        release_date !== undefined ? release_date : episode.release_date,
        status !== undefined ? status : episode.status,
        featured !== undefined ? (featured ? 1 : 0) : episode.featured,
        epId,
      ]
    );

    await logActivity(req, req.user!.id, 'UPDATE_EPISODE', 'episode', epId, `Updated episode ${newTitle}`);

    const updated = await dbGet('SELECT * FROM episodes WHERE id = ?', [epId]);
    return res.json({ success: true, message: 'Episode updated successfully', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating episode', error: err.message });
  }
});

// Toggle Episode status
router.patch('/:id/toggle', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const epId = parseInt(req.params.id);
    const { field } = req.body;

    const ep = await dbGet<any>('SELECT * FROM episodes WHERE id = ?', [epId]);
    if (!ep) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    if (field === 'status') {
      const newStatus = ep.status === 'published' ? 'draft' : 'published';
      await dbRun('UPDATE episodes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, epId]);
      await logActivity(req, req.user!.id, 'TOGGLE_EPISODE_STATUS', 'episode', epId, `Status updated to ${newStatus}`);
      return res.json({ success: true, message: `Status updated to ${newStatus}` });
    }

    return res.status(400).json({ success: false, message: 'Invalid toggle field' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error toggling episode attribute', error: err.message });
  }
});

// Delete Episode
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const epId = parseInt(req.params.id);
    const ep = await dbGet('SELECT title FROM episodes WHERE id = ?', [epId]);
    if (!ep) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    await dbRun('DELETE FROM episodes WHERE id = ?', [epId]);
    await logActivity(req, req.user!.id, 'DELETE_EPISODE', 'episode', epId, `Deleted episode "${ep.title}"`);

    return res.json({ success: true, message: 'Episode deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting episode', error: err.message });
  }
});

export default router;
