import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRouter from './routes/index.js';
import cookieParser from 'cookie-parser';

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
app.use(cookieParser());

app.use('/api/v1', apiRouter);

app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});

export default app;