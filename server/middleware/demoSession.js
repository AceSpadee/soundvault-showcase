import { env } from 'cloudflare:workers';
import { randomUUID } from 'node:crypto';

export default async function demoSession(req, res, next) {
    try {
        const existingSessionId = req.cookies.demo_session;
        let existingSession = null;
        if (existingSessionId) {
            existingSession = await env.soundvaultpublic_db.prepare(`SELECT * FROM demo_sessions WHERE id = ?`).bind(existingSessionId).first();
        }
        
        if (existingSession && Date.now() < new Date(existingSession.expires_at).getTime()) {
            req.demoSessionId = existingSession.id
            next();
            return
        }

        const sessionId = randomUUID();
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();

        await env.soundvaultpublic_db.prepare(`INSERT INTO demo_sessions (id, expires_at) VALUES (?, ?)`).bind(sessionId, expiresAt).run()

        res.cookie('demo_session', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        req.demoSessionId = sessionId
        next();
    } catch (error) {
        next(error)
    }
}