// backend/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Rate limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: unknown; password: unknown };

    // Validate both fields are present (never reveal which one is wrong)
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.trim().length === 0 ||
      password.length < 8
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpire = process.env.JWT_EXPIRE ?? '7d';

    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: jwtExpire } as jwt.SignOptions
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: (error as Error).message,
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (_req: AuthRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// POST /api/auth/seed — only works if ZERO users exist
router.post('/seed', async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCount = await User.countDocuments();

    if (existingCount > 0) {
      res.status(403).json({
        success: false,
        message: 'Admin already exists. Seeding is disabled.',
      });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      res.status(500).json({
        success: false,
        message: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables',
      });
      return;
    }

    if (adminPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'ADMIN_PASSWORD must be at least 8 characters',
      });
      return;
    }

    const superAdmin = new User({
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      role: 'superadmin',
      isActive: true,
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: (error as Error).message,
    });
  }
});

export default router;
