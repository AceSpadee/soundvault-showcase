import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const artists = await env.soundvaultpublic_db.prepare('SELECT * FROM artists').all();

        res.status(200).json(artists.results);
    } catch (error) {
        serverError(res, error);
    };
});

router.get('/:id', async (req, res) => {
    try {
        const artistId = req.params.id

        const artist = await env.soundvaultpublic_db.prepare('SELECT * FROM artists WHERE id = ?').bind(artistId).first();
        if (!artist) {
            return res.status(404).json({
                message: 'no artist found'
            })
        };
        const songs = await env.soundvaultpublic_db.prepare('SELECT * FROM songs WHERE primary_artist_id = ?').bind(artistId).all();

        res.status(200).json({
            ...artist,
            "Songs": songs.results
        });
    } catch (error) {
        serverError(res, error);
    };
});

export default router;