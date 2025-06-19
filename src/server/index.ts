import app from './app';
import { testConnection } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.BACKEND_PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 