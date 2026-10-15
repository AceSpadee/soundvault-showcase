import { env } from 'cloudflare:workers';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRouter from './routes/index.js';
import './models/index.js';
import sessionMiddleware from './config/session.js';

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
    throw new Error('missing production client origin')
}

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(express.json());

app.use(sessionMiddleware);

app.use('/api/v1', apiRouter);

app.get('/api/d1-test', async (req, res) => {
    try {
        const result = await env.soundvaultpublic_db.prepare('SELECT 1 AS connected').first();

        res.status(200).json(result)
    } catch {
        res.status(500).json({
            message: 'd1 test failed'
        })
    }
});

app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});

export default app;