// Starts the API server. (Owner: Core Team)
import { createApp } from './app.js';
import { config } from './config/env.js';
import { pingDatabase } from './config/db.js';

const app = createApp();

app.listen(config.port, async () => {
  console.log(`API running on http://localhost:${config.port}/api/v1`);
  try {
    const db = await pingDatabase();
    console.log(`Database connected: ${db.name} (MySQL ${db.version}, ${db.tables_count} tables)`);
  } catch (err) {
    console.error('Database NOT connected:', err.message);
    console.error('Check DB_HOST / DB_USER / DB_PASSWORD in backend/.env and that MySQL is running.');
  }
});
