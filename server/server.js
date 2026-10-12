import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import sequelize from './config/connection.js';
import apiRouter from './routes/index.js';
import './models/index.js';
import sessionMiddleware from './config/session.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use(sessionMiddleware);

app.use('/api/v1', apiRouter);

app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();