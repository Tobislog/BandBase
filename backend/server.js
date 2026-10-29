import app from './app.js';
import { config } from './config.js';
import { initializeDatabase, closeDatabase } from './db/index.js';

try {
    await initializeDatabase();
    const server = app.listen(config.port, () => {
        console.log(`Server runs on http://localhost:${config.port}`);
    })

    async function shutdown() {
        server.close(async () => {
            await closeDatabase();
            process.exit(0);
        });
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
} catch (err) {
    console.error('Start failed:', err.message);
    process.exit(1);
}
