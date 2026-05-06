import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { globalErrorHandler } from './utils/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import destinationRoutes from './routes/destination.routes.js';
import guideRoutes from './routes/guide.routes.js';
import categoryRoutes from './routes/category.routes.js';
import creatorApplicationRoutes from './routes/creatorApplication.routes.js';
import tripRoutes from './routes/trip.routes.js';
import reviewRoutes from './routes/review.routes.js';
import communityRoutes from './routes/community.routes.js';
import postRoutes from './routes/post.routes.js';
import followRoutes from './routes/follow.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import aiRoutes from './routes/ai.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Middleware chain (order matters) ──────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/creator-applications', creatorApplicationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MapYourNext API is running', timestamp: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────────
app.use(globalErrorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  configureCloudinary();
  app.listen(PORT, () => {
    console.log(`\n🚀 MapYourNext server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Client URL:  ${process.env.CLIENT_URL}\n`);
  });
};

start();

export default app;
