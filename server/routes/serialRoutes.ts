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

// Get all serials (with search, category filter, status filter, pagination, sorting)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : null;
    const status = req.query.status as string;
    const featured = req.query.featured !== undefined ? parseInt(req.query.featured as string) : null;
    const sortBy = (req.query.sortBy as string) || 'id';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'ASC' : 'DESC';

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (search) {
      whereConditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.country LIKE ? OR s.language LIKE ?)');
      params.push(search, search, search, search);
    }

    if (category_id) {
      whereConditions.push('s.category_id = ?');
      params.push(category_id);
    }

    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }

    if (featured !== null) {
      whereConditions.push('s.featured = ?');
      params.push(featured);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await dbGet<{ total: number }>(`SELECT COUNT(*) as total FROM serials s ${whereClause}`, params);
    const total = countResult ? countResult.total : 0;

    const allowedSortFields = ['id', 'title', 'rating', 'views', 'downloads', 'created_at', 'release_date'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';

    const serials = await dbAll(
      `SELECT s.*, c.name as category_name,
        (SELECT COUNT(*) FROM seasons WHERE serial_id = s.id) as total_seasons,
        (SELECT COUNT(*) FROM episodes WHERE serial_id = s.id) as total_episodes
       FROM serials s
       LEFT JOIN categories c ON s.category_id = c.id
       ${whereClause}
       ORDER BY s.${safeSortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      success: true,
      message: 'Serials retrieved successfully',
      data: serials,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving serials', error: err.message });
  }
});

// Get single serial by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    const isId = !isNaN(Number(param));

    const serial = isId
      ? await dbGet('SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ?', [param])
      : await dbGet('SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.slug = ?', [param]);

    if (!serial) {
      return res.status(404).json({ success: false, message: 'Serial not found', error: 'NOT_FOUND' });
    }

    // Get seasons and episodes
    const seasons = await dbAll('SELECT * FROM seasons WHERE serial_id = ? ORDER BY season_number ASC', [serial.id]);
    const cast = await dbAll(
      `SELECT sa.character_name, a.id as actor_id, a.name, a.avatar, a.slug
       FROM serial_actors sa
       JOIN actors a ON sa.actor_id = a.id
       WHERE sa.serial_id = ?`,
      [serial.id]
    );

    return res.json({
      success: true,
      data: {
        ...serial,
        seasons,
        cast,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching serial', error: err.message });
  }
});

// Create Serial
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      short_description,
      poster,
      banner,
      trailer_url,
      release_date,
      language,
      country,
      category_id,
      status,
      rating,
      featured,
      cast, // Array of { actor_id, character_name }
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required', error: 'VALIDATION_ERROR' });
    }

    let slug = slugify(title);
    const existing = await dbGet('SELECT id FROM serials WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const result = await dbRun(
      `INSERT INTO serials 
       (title, slug, description, short_description, poster, banner, trailer_url, release_date, language, country, category_id, status, rating, featured, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        title,
        slug,
        description || '',
        short_description || '',
        poster || '',
        banner || '',
        trailer_url || '',
        release_date || null,
        language || 'English',
        country || 'USA',
        category_id || null,
        status || 'published',
        rating || 0.0,
        featured ? 1 : 0,
      ]
    );

    const serialId = result.lastID;

    // Attach cast if provided
    if (Array.isArray(cast)) {
      for (const item of cast) {
        if (item.actor_id) {
          await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [
            serialId,
            item.actor_id,
            item.character_name || '',
          ]);
        }
      }
    }

    await logActivity(req, req.user!.id, 'CREATE_SERIAL', 'serial', serialId, `Created serial: ${title}`);

    const newSerial = await dbGet('SELECT * FROM serials WHERE id = ?', [serialId]);
    return res.status(201).json({ success: true, message: 'Serial created successfully', data: newSerial });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating serial', error: err.message });
  }
});

// Update Serial
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const serialId = parseInt(req.params.id);
    const serial = await dbGet('SELECT * FROM serials WHERE id = ?', [serialId]);
    if (!serial) {
      return res.status(404).json({ success: false, message: 'Serial not found', error: 'NOT_FOUND' });
    }

    const {
      title,
      description,
      short_description,
      poster,
      banner,
      trailer_url,
      release_date,
      language,
      country,
      category_id,
      status,
      rating,
      featured,
      cast,
    } = req.body;

    const newTitle = title || serial.title;
    let slug = serial.slug;
    if (title && title !== serial.title) {
      slug = slugify(title);
    }

    await dbRun(
      `UPDATE serials SET
        title = ?,
        slug = ?,
        description = ?,
        short_description = ?,
        poster = ?,
        banner = ?,
        trailer_url = ?,
        release_date = ?,
        language = ?,
        country = ?,
        category_id = ?,
        status = ?,
        rating = ?,
        featured = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newTitle,
        slug,
        description !== undefined ? description : serial.description,
        short_description !== undefined ? short_description : serial.short_description,
        poster !== undefined ? poster : serial.poster,
        banner !== undefined ? banner : serial.banner,
        trailer_url !== undefined ? trailer_url : serial.trailer_url,
        release_date !== undefined ? release_date : serial.release_date,
        language !== undefined ? language : serial.language,
        country !== undefined ? country : serial.country,
        category_id !== undefined ? category_id : serial.category_id,
        status !== undefined ? status : serial.status,
        rating !== undefined ? rating : serial.rating,
        featured !== undefined ? (featured ? 1 : 0) : serial.featured,
        serialId,
      ]
    );

    // Update cast if provided
    if (Array.isArray(cast)) {
      await dbRun('DELETE FROM serial_actors WHERE serial_id = ?', [serialId]);
      for (const item of cast) {
        if (item.actor_id) {
          await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [
            serialId,
            item.actor_id,
            item.character_name || '',
          ]);
        }
      }
    }

    await logActivity(req, req.user!.id, 'UPDATE_SERIAL', 'serial', serialId, `Updated serial: ${newTitle}`);

    const updatedSerial = await dbGet('SELECT * FROM serials WHERE id = ?', [serialId]);
    return res.json({ success: true, message: 'Serial updated successfully', data: updatedSerial });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating serial', error: err.message });
  }
});

// Toggle Publish/Unpublish or Featured Status
router.patch('/:id/toggle', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const serialId = parseInt(req.params.id);
    const { field } = req.body; // 'status' or 'featured'

    const serial = await dbGet<any>('SELECT * FROM serials WHERE id = ?', [serialId]);
    if (!serial) {
      return res.status(404).json({ success: false, message: 'Serial not found' });
    }

    if (field === 'status') {
      const newStatus = serial.status === 'published' ? 'draft' : 'published';
      await dbRun('UPDATE serials SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, serialId]);
      await logActivity(req, req.user!.id, 'TOGGLE_SERIAL_STATUS', 'serial', serialId, `Toggled status to ${newStatus}`);
      return res.json({ success: true, message: `Status updated to ${newStatus}` });
    } else if (field === 'featured') {
      const newFeatured = serial.featured ? 0 : 1;
      await dbRun('UPDATE serials SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newFeatured, serialId]);
      await logActivity(req, req.user!.id, 'TOGGLE_SERIAL_FEATURED', 'serial', serialId, `Toggled featured to ${newFeatured ? 'Yes' : 'No'}`);
      return res.json({ success: true, message: `Featured updated to ${newFeatured ? 'Yes' : 'No'}` });
    }

    return res.status(400).json({ success: false, message: 'Invalid toggle field' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error toggling serial attribute', error: err.message });
  }
});

// Delete Serial
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const serialId = parseInt(req.params.id);
    const serial = await dbGet<any>('SELECT title FROM serials WHERE id = ?', [serialId]);
    if (!serial) {
      return res.status(404).json({ success: false, message: 'Serial not found' });
    }

    await dbRun('DELETE FROM serials WHERE id = ?', [serialId]);
    await logActivity(req, req.user!.id, 'DELETE_SERIAL', 'serial', serialId, `Deleted serial "${serial.title}"`);

    return res.json({ success: true, message: 'Serial deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting serial', error: err.message });
  }
});

export default router;
