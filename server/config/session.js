import 'dotenv/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sessionMiddleware = session({
    store: new PgSession({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
});

export default sessionMiddleware;