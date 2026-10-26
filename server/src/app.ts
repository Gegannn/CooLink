import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import skillRoutes from './routes/skill.routes';
import workerRoutes from './routes/worker.routes';
import jobRoutes from './routes/job.routes';
import workRequestRoutes from './routes/workRequest.routes';
import reviewRoutes from './routes/review.routes';
import verificationRoutes from './routes/verification.routes';
import reportRoutes from './routes/report.routes';
import conversationRoutes from './routes/conversation.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'CooLink Backend API',
  });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/work-requests', workRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
