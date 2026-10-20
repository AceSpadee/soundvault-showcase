import app from './app.js';
import { httpServerHandler } from 'cloudflare:node';
import { cleanupExpiredSessions } from './helpers/cleanupExpiredSessions.js';

app.listen(3000);

const httpHandler = httpServerHandler({ port: 3000 });

export default {
    fetch: httpHandler.fetch,
    async scheduled(event, env, ctx) {
        await cleanupExpiredSessions()
    }
};