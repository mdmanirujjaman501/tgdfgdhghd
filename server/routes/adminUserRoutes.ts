import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, authorizeRoles, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

// Get all admin users
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const admins = await dbAll(
      `SELECT id, name, email, avatar, role, status, last_login, created_at, updated_at
       FROM admins ORDER BY id ASC`
    );
    return res.json({ success: true, data: admins });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching admins', error: err.message });
  }
});

// Create new admin (Super Admin only)
router.post('/', authenticateAdmin, authorizeRoles(['Super Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await dbGet('SELECT id FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO admins (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      [name, email.trim().toLowerCase(), hashedPw, role || 'Admin', status || 'active']
    );

    await logActivity(req, req.user!.id, 'CREATE_ADMIN', 'admin', result.lastID, `Created new admin user "${name}" with role ${role || 'Admin'}`);

    const newAdmin = await dbGet('SELECT id, name, email, role, status, created_at FROM admins WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Admin user created successfully', data: newAdmin });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating admin', error: err.message });
  }
});

// Update admin user (Super Admin only)
router.put('/:id', authenticateAdmin, authorizeRoles(['Super Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    const admin = await dbGet('SELECT * FROM admins WHERE id = ?', [targetId]);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin user not found' });

    const { name, email, role, status } = req.body;

    await dbRun(
      `UPDATE admins SET name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name || admin.name, email || admin.email, role || admin.role, status || admin.status, targetId]
    );

    await logActivity(req, req.user!.id, 'UPDATE_ADMIN', 'admin', targetId, `Updated admin details for ${admin.email}`);

    return res.json({ success: true, message: 'Admin user updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating admin', error: err.message });
  }
});

// Reset admin password (Super Admin only)
router.post('/:id/reset-password', authenticateAdmin, authorizeRoles(['Super Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    const { new_password } = req.body;
    if (!new_password) return res.status(400).json({ success: false, message: 'New password is required.' });

    const hashedPw = await bcrypt.hash(new_password, 10);
    await dbRun('UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPw, targetId]);

    await logActivity(req, req.user!.id, 'RESET_ADMIN_PASSWORD', 'admin', targetId, `Reset password for admin #${targetId}`);

    return res.json({ success: true, message: 'Admin password reset successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error resetting password', error: err.message });
  }
});

// Delete admin (Super Admin only)
router.delete('/:id', authenticateAdmin, authorizeRoles(['Super Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.user!.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await dbRun('DELETE FROM admins WHERE id = ?', [targetId]);
    await logActivity(req, req.user!.id, 'DELETE_ADMIN', 'admin', targetId, `Deleted admin user #${targetId}`);

    return res.json({ success: true, message: 'Admin user deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting admin', error: err.message });
  }
});

export default router;
