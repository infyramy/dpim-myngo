// Database utilities for frontend (if needed)
// The main database operations are handled by the backend server

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Test connection via API endpoint
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}; 