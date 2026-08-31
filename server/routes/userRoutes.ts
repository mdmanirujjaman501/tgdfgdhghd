import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get users list with pagination, search & status filter
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status as string;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(search, search);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await dbGet<{ total: number }>(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult ? countResult.total : 0;

    const users = await dbAll(
      `SELECT id, name, email, avatar, role, status, last_login, created_at, updated_at
       FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
});

// Update user status or role
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, status } = req.body;

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await dbRun(
      `UPDATE users SET name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name || user.name, email || user.email, role || user.role, status || user.status, userId]
    );

    await logActivity(req, req.user!.id, 'UPDATE_USER', 'user', userId, `Updated user account ${user.email}`);

    return res.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating user', error: err.message });
  }
});

// Delete user
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    await dbRun('DELETE FROM users WHERE id = ?', [userId]);
    await logActivity(req, req.user!.id, 'DELETE_USER', 'user', userId, `Deleted user account #${userId}`);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting user', error: err.message });
  }
});

export default router;
