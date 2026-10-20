import { env } from 'cloudflare:workers';

export async function cleanupExpiredSessions() {
    const statements = [];

    const deleteExpiredPlaylists = env.soundvaultpublic_db
        .prepare(`DELETE FROM playlists WHERE demo_session_id IN (SELECT id FROM demo_sessions WHERE expires_at < ?)`)
        .bind(new Date().toISOString())

    statements.push(deleteExpiredPlaylists);

    const deleteExpiredSessions = env.soundvaultpublic_db
        .prepare(`DELETE FROM demo_sessions WHERE expires_at < ?`)
        .bind(new Date().toISOString())
    
    statements.push(deleteExpiredSessions);

    await env.soundvaultpublic_db.batch(statements);
}