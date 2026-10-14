require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }

  try {
    await testConnection();
    console.log('MySQL connection established');
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    console.error('Ensure MySQL is running and .env credentials are correct.');
    console.error('Apply schema with: mysql -u root -p < ../database/schema.sql');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
