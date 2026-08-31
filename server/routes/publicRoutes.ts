import { Router } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { validateApiKey } from '../middleware/auth';

const router = Router();

// Apply API Key validation middleware
router.use(validateApiKey);

// Standardized API JSON response helper
function sendSuccess(res: any, data: any, pagination?: any, message: string = 'Data retrieved successfully') {
  return res.json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
}

function sendError(res: any, status: number, message: string, errorCode: string) {
  return res.status(status).json({
    success: false,
    message,
    error: errorCode,
  });
}

// 1. Serials Listing (Pagination, Search, Filter)
router.get('/serials', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const category = req.query.category as string;
    const genre = req.query.genre as string;
    const language = req.query.language as string;
    const country = req.query.country as string;
    const search = req.query.q || req.query.search;
    const sortBy = (req.query.sortBy as string) || 'created_at';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'ASC' : 'DESC';

    let whereConditions: string[] = ["s.status = 'published'"];
    let params: any[] = [];

    if (category) {
      whereConditions.push('(c.slug = ? OR c.name = ?)');
      params.push(category, category);
    }

    if (language) {
      whereConditions.push('s.language = ?');
      params.push(language);
    }

    if (country) {
      whereConditions.push('s.country = ?');
      params.push(country);
    }

    if (search) {
      whereConditions.push('(s.title LIKE ? OR s.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const countResult = await dbGet<{ total: number }>(
      `SELECT COUNT(*) as total FROM serials s LEFT JOIN categories c ON s.category_id = c.id ${whereClause}`,
      params
    );
    const total = countResult ? countResult.total : 0;

    const allowedSorts = ['id', 'title', 'views', 'downloads', 'rating', 'created_at', 'release_date'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';

    const serials = await dbAll(
      `SELECT s.id, s.title, s.slug, s.description, s.short_description, s.poster, s.banner,
              s.trailer_url, s.release_date, s.language, s.country, s.rating, s.featured,
              s.views, s.downloads, s.created_at, c.name as category_name, c.slug as category_slug
       FROM serials s
       LEFT JOIN categories c ON s.category_id = c.id
       ${whereClause}
       ORDER BY s.${safeSort} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return sendSuccess(res, serials, {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 2. Single Serial details with Seasons & Cast
router.get('/serials/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    const isId = !isNaN(Number(param));

    const serial = isId
      ? await dbGet(`SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ? AND s.status = 'published'`, [param])
      : await dbGet(`SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.slug = ? AND s.status = 'published'`, [param]);

    if (!serial) {
      return sendError(res, 404, 'Serial not found or unpublished', 'NOT_FOUND');
    }

    // Increment view count
    await dbRun('UPDATE serials SET views = views + 1 WHERE id = ?', [serial.id]);

    const seasons = await dbAll('SELECT * FROM seasons WHERE serial_id = ? AND status = "published" ORDER BY season_number ASC', [serial.id]);
    const cast = await dbAll(
      `SELECT sa.character_name, a.id as actor_id, a.name, a.avatar, a.slug
       FROM serial_actors sa JOIN actors a ON sa.actor_id = a.id
       WHERE sa.serial_id = ?`,
      [serial.id]
    );

    return sendSuccess(res, {
      ...serial,
      seasons,
      cast,
    });
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 3. Featured Serials
router.get('/featured', async (req, res) => {
  try {
    const serials = await dbAll(
      `SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.featured = 1 AND s.status = 'published' ORDER BY s.rating DESC LIMIT 10`
    );
    return sendSuccess(res, serials);
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 4. Trending Serials (Calculated using views, downloads & recent engagement)
router.get('/trending', async (req, res) => {
  try {
    const serials = await dbAll(
      `SELECT s.*, c.name as category_name, (s.views * 1.5 + s.downloads * 3.0) as trend_score
       FROM serials s LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.status = 'published'
       ORDER BY trend_score DESC LIMIT 10`
    );
    return sendSuccess(res, serials);
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 5. Latest Serials
router.get('/latest', async (req, res) => {
  try {
    const serials = await dbAll(
      `SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.status = 'published' ORDER BY s.created_at DESC LIMIT 10`
    );
    return sendSuccess(res, serials);
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 6. Popular Serials
router.get('/popular', async (req, res) => {
  try {
    const serials = await dbAll(
      `SELECT s.*, c.name as category_name FROM serials s LEFT JOIN categories c ON s.category_id = c.id WHERE s.status = 'published' ORDER BY s.views DESC LIMIT 10`
    );
    return sendSuccess(res, serials);
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 7. Episodes Listing
router.get('/episodes', async (req, res) => {
  try {
    const serial_id = req.query.serial_id ? parseInt(req.query.serial_id as string) : null;
    const season_id = req.query.season_id ? parseInt(req.query.season_id as string) : null;

    let whereConditions: string[] = ["e.status = 'published'"];
    let params: any[] = [];

    if (serial_id) {
      whereConditions.push('e.serial_id = ?');
      params.push(serial_id);
    }

    if (season_id) {
      whereConditions.push('e.season_id = ?');
      params.push(season_id);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const episodes = await dbAll(
      `SELECT e.*, ser.title as serial_title, s.season_number
       FROM episodes e
       JOIN serials ser ON e.serial_id = ser.id
       JOIN seasons s ON e.season_id = s.id
       ${whereClause}
       ORDER BY e.episode_number ASC`,
      params
    );

    return sendSuccess(res, episodes);
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 8. Single Episode details with streaming media sources
router.get('/episodes/:id', async (req, res) => {
  try {
    const episode = await dbGet(
      `SELECT e.*, ser.title as serial_title, ser.poster as serial_poster, s.season_number
       FROM episodes e
       JOIN serials ser ON e.serial_id = ser.id
       JOIN seasons s ON e.season_id = s.id
       WHERE e.id = ? AND e.status = 'published'`,
      [req.params.id]
    );

    if (!episode) {
      return sendError(res, 404, 'Episode not found or unpublished', 'NOT_FOUND');
    }

    const mediaSources = await dbAll('SELECT * FROM media_sources WHERE episode_id = ? AND status = "active"', [episode.id]);

    return sendSuccess(res, {
      ...episode,
      media_sources: mediaSources,
    });
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 9. Record View on Episode
router.post('/episodes/:id/view', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const episode = await dbGet<any>('SELECT serial_id FROM episodes WHERE id = ?', [episodeId]);
    if (!episode) return sendError(res, 404, 'Episode not found', 'NOT_FOUND');

    await dbRun('UPDATE episodes SET views = views + 1 WHERE id = ?', [episodeId]);
    await dbRun('UPDATE serials SET views = views + 1 WHERE id = ?', [episode.serial_id]);
    await dbRun('INSERT INTO views (serial_id, episode_id, ip_address) VALUES (?, ?, ?)', [episode.serial_id, episodeId, req.ip || '127.0.0.1']);

    return sendSuccess(res, { viewed: true }, undefined, 'View recorded successfully');
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 10. Record Download on Episode
router.post('/episodes/:id/download', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const episode = await dbGet<any>('SELECT serial_id FROM episodes WHERE id = ?', [episodeId]);
    if (!episode) return sendError(res, 404, 'Episode not found', 'NOT_FOUND');

    await dbRun('UPDATE episodes SET downloads = downloads + 1 WHERE id = ?', [episodeId]);
    await dbRun('UPDATE serials SET downloads = downloads + 1 WHERE id = ?', [episode.serial_id]);
    await dbRun('INSERT INTO downloads (serial_id, episode_id, ip_address) VALUES (?, ?, ?)', [episode.serial_id, episodeId, req.ip || '127.0.0.1']);

    return sendSuccess(res, { downloaded: true }, undefined, 'Download recorded successfully');
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 11. Global Search Endpoint
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return sendSuccess(res, { serials: [], episodes: [], actors: [] });

    const q = `%${query}%`;
    const serials = await dbAll('SELECT id, title, slug, poster, rating, views FROM serials WHERE title LIKE ? OR description LIKE ? LIMIT 10', [q, q]);
    const episodes = await dbAll('SELECT e.id, e.title, e.thumbnail, e.duration, ser.title as serial_title FROM episodes e JOIN serials ser ON e.serial_id = ser.id WHERE e.title LIKE ? LIMIT 10', [q]);
    const actors = await dbAll('SELECT id, name, slug, avatar, nationality FROM actors WHERE name LIKE ? LIMIT 10', [q]);

    return sendSuccess(res, { serials, episodes, actors });
  } catch (err: any) {
    return sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 12. Public Taxonomies
router.get('/categories', async (req, res) => {
  const cats = await dbAll("SELECT id, name, slug, description FROM categories WHERE status = 'active' ORDER BY name ASC");
  return sendSuccess(res, cats);
});

router.get('/genres', async (req, res) => {
  const genres = await dbAll("SELECT id, name, slug, description FROM genres WHERE status = 'active' ORDER BY name ASC");
  return sendSuccess(res, genres);
});

router.get('/actors', async (req, res) => {
  const actors = await dbAll('SELECT id, name, slug, avatar, biography, nationality FROM actors ORDER BY name ASC');
  return sendSuccess(res, actors);
});

export default router;
