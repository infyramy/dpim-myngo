import app from './app';
import { testConnection } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.API_PORT || process.env.API_SERVER_PORT || process.env.BACKEND_PORT || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');
    
    // Start server
    app.listen(Number(PORT), HOST, () => {
      console.log(`🚀 Backend server running on ${HOST}:${PORT}`);
      console.log(`📍 API available at http://${HOST}:${PORT}`);
      console.log(`🏥 Health check at http://${HOST}:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer(); 