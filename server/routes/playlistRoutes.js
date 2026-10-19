import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const playlist = await env.soundvaultpublic_db
            .prepare('SELECT * FROM playlists WHERE demo_session_id = ?')
            .bind(req.demoSessionId)
            .all()

        res.status(200).json(playlist.results);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const user_id = req.demoSessionId;

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (name.trim() === '') {
            return res.status(400).json({
                message: 'missing playlist name'
            })
        }

        const createdPlaylist = await env.soundvaultpublic_db
            .prepare('INSERT INTO playlists (demo_session_id, name) VALUES (?, ?) RETURNING *')
            .bind(user_id, name.trim())
            .first()

        res.status(201).json(createdPlaylist);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.demoSessionId;
        const playlist = await env.soundvaultpublic_db
            .prepare('SELECT * FROM playlists WHERE id = ? AND demo_session_id = ?')
            .bind(playlistId, user_id)
            .first()

        if (!playlist) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        res.status(200).json(playlist);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.demoSessionId;
        const { name } = req.body;

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (name.trim() === '') {
            return res.status(400).json({
                message: 'missing playlist name'
            })
        }

        const updatedPlaylist = await env.soundvaultpublic_db
            .prepare(`UPDATE playlists 
                SET name = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND demo_session_id = ? 
                RETURNING *`)
            .bind(name.trim(), playlistId, user_id)
            .first()

        if (!updatedPlaylist) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.demoSessionId;
        const playlist = await env.soundvaultpublic_db
            .prepare('DELETE FROM playlists WHERE id = ? AND demo_session_id = ? RETURNING *')
            .bind(playlistId, user_id)
            .first()

        if (!playlist) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        res.status(200).json({
            message: 'playlist deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;