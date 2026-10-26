import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { User } from './models/User';
import { seedDatabase } from './scripts/seed';

const startServer = async () => {
  try {
    // Connect to database (either external MONGODB_URI or in-memory runner)
    await connectDatabase();

    // Auto-seed demo data if database is fresh / in-memory
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Fresh database detected. Auto-seeding Kerala workers, employers & jobs...');
      await seedDatabase();
    }

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 CooLink Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
