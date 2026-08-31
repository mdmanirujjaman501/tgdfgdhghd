import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tv_serial_admin_jwt_secret_key_2026';

// Admin Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.', error: 'VALIDATION_ERROR' });
    }

    const admin = await dbGet<any>('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.', error: 'INVALID_CREDENTIALS' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your admin account has been suspended.', error: 'ACCOUNT_SUSPENDED' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.', error: 'INVALID_CREDENTIALS' });
    }

    // Update last login
    await dbRun('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    const tokenPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    await logActivity(req, admin.id, 'LOGIN', 'admin', admin.id, `Admin ${admin.name} logged in successfully.`);

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
});

// Get Current Logged-in Admin Info
router.get('/me', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await dbGet<any>('SELECT id, name, email, role, avatar, status, last_login, created_at FROM admins WHERE id = ?', [req.user!.id]);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.', error: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: admin });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving user details.', error: err.message });
  }
});

// Change Password
router.post('/change-password', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.', error: 'VALIDATION_ERROR' });
    }

    const admin = await dbGet<any>('SELECT * FROM admins WHERE id = ?', [req.user!.id]);
    const isMatch = await bcrypt.compare(current_password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.', error: 'INVALID_PASSWORD' });
    }

    const hashedPw = await bcrypt.hash(new_password, 10);
    await dbRun('UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPw, req.user!.id]);

    await logActivity(req, req.user!.id, 'CHANGE_PASSWORD', 'admin', req.user!.id, 'Admin updated password.');

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating password.', error: err.message });
  }
});

export default router;
