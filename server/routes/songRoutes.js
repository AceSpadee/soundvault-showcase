import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const song = await env.soundvaultpublic_db
            .prepare('SELECT songs.*, artists.id AS artist_id, artists.name AS artist_name, artists.musicbrainz_id AS artist_musicbrainz_id, artists.created_at AS artist_created_at, artists.updated_at AS artist_updated_at FROM songs JOIN artists ON songs.primary_artist_id = artists.id')
            .all();

        const formattedSongs = song.results.map((item) => {
            const { artist_id, artist_name, artist_musicbrainz_id, artist_created_at, artist_updated_at, ...remainingFields } = item;
            
            return {
                ...remainingFields,
                "Artist": {
                    id: artist_id,
                    name: artist_name,
                    musicbrainz_id: artist_musicbrainz_id,
                    created_at: artist_created_at,
                    updated_at: artist_updated_at
                }
            }
        })

        res.status(200).json(formattedSongs);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const songId = req.params.id

        const song = await env.soundvaultpublic_db
            .prepare('SELECT songs.*, artists.id AS artist_id, artists.name AS artist_name, artists.musicbrainz_id AS artist_musicbrainz_id, artists.created_at AS artist_created_at, artists.updated_at AS artist_updated_at FROM songs JOIN artists ON songs.primary_artist_id = artists.id WHERE songs.id = ?')
            .bind(songId)
            .first();

        if (!song) {
            return res.status(404).json({
                message: 'no song found'
            })
        }

        const { artist_id, artist_name, artist_musicbrainz_id, artist_created_at, artist_updated_at, ...remainingFields } = song;
        
        const formattedSong = {
            ...remainingFields,
            "Artist": {
                id: artist_id,
                name: artist_name,
                musicbrainz_id: artist_musicbrainz_id,
                created_at: artist_created_at,
                updated_at: artist_updated_at
            }
        }

        res.status(200).json(formattedSong);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;