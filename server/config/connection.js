import 'dotenv/config';
import { Sequelize } from "sequelize";
import pg from 'pg';

if (process.env.NODE_ENV === 'production' && (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST)) {
    throw new Error('missing db variable')
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg,
});

export default sequelize;