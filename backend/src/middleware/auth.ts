import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';

export interface AuthRequest extends Request {
  adminId?: string;
}

function extractToken(req: Request): string | null {
  // 1. httpOnly cookie (primary)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    for (const pair of cookieHeader.split(';')) {
      const [k, v] = pair.trim().split('=');
      if (k === 'adminToken' && v) return decodeURIComponent(v);
    }
  }
  // 2. Authorization: Bearer <token> (fallback for API clients)
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.split(' ')[1];
  return null;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; iat?: number };
    req.adminId = decoded.id;

    // Session invalidation: reject tokens issued before the last password change
    if (decoded.iat) {
      const admin = await Admin.findById(decoded.id).select('passwordChangedAt').lean();
      if (admin?.passwordChangedAt) {
        const changedAtSec = Math.floor(admin.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < changedAtSec) {
          res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
          return;
        }
      }
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
