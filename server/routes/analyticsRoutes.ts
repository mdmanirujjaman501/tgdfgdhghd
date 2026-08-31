import { Router, Response } from 'express';
import { dbAll, dbGet } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard Statistics Overview
router.get('/dashboard', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalSerials = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM serials'))?.cnt || 0;
    const totalEpisodes = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM episodes'))?.cnt || 0;
    const totalSeasons = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM seasons'))?.cnt || 0;
    const totalCategories = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM categories'))?.cnt || 0;
    const totalActors = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM actors'))?.cnt || 0;
    const totalUsers = (await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users'))?.cnt || 0;

    const viewsResult = await dbGet<{ total: number }>('SELECT SUM(views) as total FROM serials');
    const totalViews = viewsResult?.total || 0;

    const downloadsResult = await dbGet<{ total: number }>('SELECT SUM(downloads) as total FROM serials');
    const totalDownloads = downloadsResult?.total || 0;

    // Recently added serials
    const recentSerials = await dbAll(
      `SELECT s.id, s.title, s.poster, s.status, s.created_at, c.name as category_name
       FROM serials s LEFT JOIN categories c ON s.category_id = c.id
       ORDER BY s.created_at DESC LIMIT 5`
    );

    // Recently added episodes
    const recentEpisodes = await dbAll(
      `SELECT e.id, e.title, e.thumbnail, e.duration, e.status, e.created_at, ser.title as serial_title
       FROM episodes e JOIN serials ser ON e.serial_id = ser.id
       ORDER BY e.created_at DESC LIMIT 5`
    );

    // Most viewed serials
    const mostViewedSerials = await dbAll(
      `SELECT id, title, poster, views, rating FROM serials ORDER BY views DESC LIMIT 5`
    );

    // Most downloaded serials
    const mostDownloadedSerials = await dbAll(
      `SELECT id, title, poster, downloads, rating FROM serials ORDER BY downloads DESC LIMIT 5`
    );

    // Recent Activity logs
    const recentActivity = await dbAll(
      `SELECT al.*, a.name as admin_name
       FROM activity_logs al
       LEFT JOIN admins a ON al.admin_id = a.id
       ORDER BY al.created_at DESC LIMIT 10`
    );

    return res.json({
      success: true,
      data: {
        totals: {
          serials: totalSerials,
          episodes: totalEpisodes,
          seasons: totalSeasons,
          categories: totalCategories,
          actors: totalActors,
          views: totalViews,
          downloads: totalDownloads,
          users: totalUsers,
        },
        recentSerials,
        recentEpisodes,
        mostViewedSerials,
        mostDownloadedSerials,
        recentActivity,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: err.message });
  }
});

// Analytics Charts Time-series Data
router.get('/charts', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Generate realistic daily time-series performance data for charts
    const timeSeriesData = [
      { date: 'Mon', views: 2400, downloads: 1200, serialsAdded: 2, episodesAdded: 8 },
      { date: 'Tue', views: 3200, downloads: 1800, serialsAdded: 1, episodesAdded: 12 },
      { date: 'Wed', views: 2900, downloads: 1500, serialsAdded: 3, episodesAdded: 10 },
      { date: 'Thu', views: 4100, downloads: 2200, serialsAdded: 2, episodesAdded: 15 },
      { date: 'Fri', views: 5600, downloads: 3100, serialsAdded: 4, episodesAdded: 22 },
      { date: 'Sat', views: 7800, downloads: 4500, serialsAdded: 5, episodesAdded: 30 },
      { date: 'Sun', views: 8900, downloads: 5200, serialsAdded: 3, episodesAdded: 25 },
    ];

    return res.json({ success: true, data: timeSeriesData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching chart analytics', error: err.message });
  }
});

// Activity logs endpoint
router.get('/activity-logs', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await dbGet<{ total: number }>('SELECT COUNT(*) as total FROM activity_logs');
    const total = countResult ? countResult.total : 0;

    const logs = await dbAll(
      `SELECT al.*, a.name as admin_name, a.email as admin_email
       FROM activity_logs al
       LEFT JOIN admins a ON al.admin_id = a.id
       ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching activity logs', error: err.message });
  }
});

export default router;
