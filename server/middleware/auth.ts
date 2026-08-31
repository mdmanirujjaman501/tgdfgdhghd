import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'tv_serial_admin_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  apiKey?: {
    id: number;
    name: string;
    rate_limit: number;
  };
}

export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing token.', error: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.', error: 'UNAUTHORIZED' });
  }
}

export function authorizeRoles(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.', error: 'UNAUTHORIZED' });
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: `Access denied. Requires role: ${allowedRoles.join(', ')}`, error: 'FORBIDDEN' });
    }
    next();
  };
}

export async function validateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  // Support both header X-API-Key or Bearer token or query param api_key
  const apiKeyHeader = req.headers['x-api-key'] as string || req.query.api_key as string;
  const authHeader = req.headers.authorization;
  
  let apiKeyVal = apiKeyHeader;
  if (!apiKeyVal && authHeader && authHeader.startsWith('Bearer sk_')) {
    apiKeyVal = authHeader.split(' ')[1];
  }

  if (!apiKeyVal) {
    // If no API Key provided, allow public browsing with default rate limits
    return next();
  }

  try {
    const keyRecord = await dbGet<any>('SELECT * FROM api_keys WHERE key_value = ? AND status = ?', [apiKeyVal, 'active']);
    if (!keyRecord) {
      return res.status(401).json({ success: false, message: 'Invalid or revoked API Key.', error: 'INVALID_API_KEY' });
    }

    // Update usage count and last used timestamp
    await dbRun('UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [keyRecord.id]);

    req.apiKey = {
      id: keyRecord.id,
      name: keyRecord.name,
      rate_limit: keyRecord.rate_limit,
    };

    next();
  } catch (err) {
    next(err);
  }
}
