import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.post('/reset', async (req, res) => {
    try {
        const user_id = req.demoSessionId;

        const deleteFavorites = env.soundvaultpublic_db.prepare('DELETE FROM favorites WHERE demo_session_id = ?').bind(user_id);
        const deletePlaylists = env.soundvaultpublic_db.prepare('DELETE FROM playlists WHERE demo_session_id = ?').bind(user_id);
        const deleteListeningEvents = env.soundvaultpublic_db.prepare('DELETE FROM listening_events WHERE demo_session_id = ?').bind(user_id);

        await env.soundvaultpublic_db.batch([deleteFavorites, deletePlaylists, deleteListeningEvents])

        return res.status(200).json({
            message: 'Demo reset successfully',
            sessionId: user_id
        })
    } catch (error) {
        serverError(res, error);
    }
});

export default router;