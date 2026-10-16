import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const recording = await env.soundvaultpublic_db
            .prepare(`SELECT recordings.*, 
                        songs.id AS song_id_alias, 
                        songs.title AS song_title, 
                        songs.primary_artist_id AS song_primary_artist_id, 
                        songs.created_at AS song_created_at,
                        songs.updated_at AS song_updated_at
                        FROM recordings 
                        JOIN songs 
                        ON recordings.song_id = songs.id
            `)
            .all();

        const formattedRecordings = recording.results.map((item) => {
            const { song_id_alias, song_title, song_primary_artist_id, song_created_at, song_updated_at, ...remainingFields } = item

            return {
                ...remainingFields,
                "Song": {
                    id: song_id_alias,
                    title: song_title,
                    primary_artist_id: song_primary_artist_id,
                    created_at: song_created_at,
                    updated_at: song_updated_at
                }
            }
        })

        res.status(200).json(formattedRecordings);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recordId = req.params.id;
        const recording = await env.soundvaultpublic_db
            .prepare(`SELECT recordings.*, 
                        songs.id AS song_id_alias, 
                        songs.title AS song_title, 
                        songs.primary_artist_id AS song_primary_artist_id, 
                        songs.created_at AS song_created_at,
                        songs.updated_at AS song_updated_at
                        FROM recordings 
                        JOIN songs 
                        ON recordings.song_id = songs.id 
                        WHERE recordings.id = ?`)
            .bind(recordId)
            .first();

        if (!recording) {
            return res.status(404).json({
                message: 'no recording found'
            })
        }

        const { song_id_alias, song_title, song_primary_artist_id, song_created_at, song_updated_at, ...remainingFields } = recording

        const formattedRecording = {
            ...remainingFields,
            "Song": {
                id: song_id_alias,
                title: song_title,
                primary_artist_id: song_primary_artist_id,
                created_at: song_created_at,
                updated_at: song_updated_at
            }
        }

        res.status(200).json(formattedRecording);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;