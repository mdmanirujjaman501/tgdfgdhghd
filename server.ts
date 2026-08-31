import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db';

// Route Imports
import authRoutes from './server/routes/authRoutes';
import serialRoutes from './server/routes/serialRoutes';
import seasonRoutes from './server/routes/seasonRoutes';
import episodeRoutes from './server/routes/episodeRoutes';
import mediaRoutes from './server/routes/mediaRoutes';
import taxonomyRoutes from './server/routes/taxonomyRoutes';
import actorRoutes from './server/routes/actorRoutes';
import userRoutes from './server/routes/userRoutes';
import adminUserRoutes from './server/routes/adminUserRoutes';
import apiKeyRoutes from './server/routes/apiKeyRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import settingsRoutes from './server/routes/settingsRoutes';
import publicRoutes from './server/routes/publicRoutes';
import uploadRoutes from './server/routes/uploadRoutes';
import monetizationRoutes from './server/routes/monetizationRoutes';
import subscriptionRoutes from './server/routes/subscriptionRoutes';
import contentToolsRoutes from './server/routes/contentToolsRoutes';
import platformRoutes from './server/routes/platformRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  await initDatabase();

  // Middleware
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static Uploads Directory
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'TV Serial CMS API', timestamp: new Date().toISOString() });
  });

  // Admin API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/serials', serialRoutes);
  app.use('/api/seasons', seasonRoutes);
  app.use('/api/episodes', episodeRoutes);
  app.use('/api/media-sources', mediaRoutes);
  app.use('/api/taxonomies', taxonomyRoutes);
  app.use('/api/actors', actorRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin-users', adminUserRoutes);
  app.use('/api/api-keys', apiKeyRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/monetization', monetizationRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/tools', contentToolsRoutes);
  app.use('/api/platform', platformRoutes);

  // Headless Public REST API
  app.use('/api/v1/public', publicRoutes);

  // Vite Middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Mounting production static files...');
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`  TV Serial CMS API Server running on port ${PORT} `);
    console.log(`  Access URL: http://0.0.0.0:${PORT}               `);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server Fatal] Failed to start server:', err);
  process.exit(1);
});
