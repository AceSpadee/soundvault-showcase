import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const favorites = await env.soundvaultpublic_db
            .prepare(`SELECT favorites.*,
                recordings.id AS recording_id_alias,
                recordings.song_id AS recording_song_id,
                recordings.version AS recording_version,
                recordings.musicbrainz_id AS recording_musicbrainz_id,
                recordings.audio_url AS recording_audio_url,
                recordings.duration AS recording_duration,
                recordings.created_at AS recording_created_at,
                recordings.updated_at AS recording_updated_at
                FROM favorites 
                JOIN recordings
                ON favorites.recording_id = recordings.id
                WHERE demo_session_id = ?`)
            .bind(req.demoSessionId)
            .all()

        const formattedFavorites = favorites.results.map((item) => {
            const { recording_id_alias, 
                recording_song_id, 
                recording_version, 
                recording_musicbrainz_id, 
                recording_audio_url, 
                recording_duration, 
                recording_created_at,
                recording_updated_at,
                ...remainingFields
            } = item

            return {
                ...remainingFields,
                "Recording": {
                    id: recording_id_alias,
                    song_id: recording_song_id, 
                    version: recording_version, 
                    musicbrainz_id: recording_musicbrainz_id, 
                    audio_url: recording_audio_url, 
                    duration: recording_duration, 
                    created_at: recording_created_at,
                    updated_at: recording_updated_at,
                }
            }
        })

        res.status(200).json(formattedFavorites);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { recording_id } = req.body;
        const user_id = req.demoSessionId;
        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        }

        const isFavorite = await env.soundvaultpublic_db
            .prepare(`SELECT * 
                FROM favorites 
                WHERE demo_session_id = ? AND recording_id = ?`)
            .bind(user_id, recording_id)
            .first()

        if (isFavorite) {
            return res.status(409).json({
                message: 'recording already favorited'
            })
        }

        const createdFavorite = await env.soundvaultpublic_db
            .prepare('INSERT INTO favorites (demo_session_id, recording_id) VALUES (?, ?) RETURNING *')
            .bind(user_id, recording_id)
            .first()

        res.status(201).json(createdFavorite);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const favoriteId = req.params.id
        const favorite = await env.soundvaultpublic_db
            .prepare(`SELECT favorites.*, 
                recordings.id AS recording_id_alias,
                recordings.song_id AS recording_song_id,
                recordings.version AS recording_version,
                recordings.musicbrainz_id AS recording_musicbrainz_id,
                recordings.audio_url AS recording_audio_url,
                recordings.duration AS recording_duration,
                recordings.created_at AS recording_created_at,
                recordings.updated_at AS recording_updated_at
                FROM favorites 
                JOIN recordings
                ON favorites.recording_id = recordings.id
                WHERE favorites.id = ? AND favorites.demo_session_id = ?`)
            .bind(favoriteId, req.demoSessionId)
            .first()

        if (!favorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        const { recording_id_alias, 
                recording_song_id, 
                recording_version, 
                recording_musicbrainz_id, 
                recording_audio_url, 
                recording_duration, 
                recording_created_at,
                recording_updated_at,
                ...remainingFields
            } = favorite

        const formattedFavorite = {
            ...remainingFields,
            "Recording": {
                id: recording_id_alias,
                song_id: recording_song_id, 
                version: recording_version, 
                musicbrainz_id: recording_musicbrainz_id, 
                audio_url: recording_audio_url, 
                duration: recording_duration, 
                created_at: recording_created_at,
                updated_at: recording_updated_at,
            }
        }

        res.status(200).json(formattedFavorite);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const favoriteId = req.params.id
        const { recording_id } = req.body;
        const user_id = req.demoSessionId;
        const foundFavorite = await env.soundvaultpublic_db
            .prepare('SELECT * FROM favorites WHERE id = ? AND demo_session_id = ?')
            .bind(favoriteId, user_id)
            .first()

        if (!foundFavorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        }

        const isFavorite = await env.soundvaultpublic_db
            .prepare('SELECT * FROM favorites WHERE demo_session_id = ? AND recording_id = ?')
            .bind(user_id, recording_id)
            .first()

        if (isFavorite && isFavorite.id !== foundFavorite.id) {
            return res.status(409).json({
                message: 'recording already favorited'
            })
        }

        const updatedFavorite = await env.soundvaultpublic_db
            .prepare(`UPDATE favorites 
                SET recording_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND demo_session_id = ?
                RETURNING *`)
            .bind(recording_id, favoriteId, user_id)
            .first()

        res.status(200).json(updatedFavorite);
    } catch (error) {
        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const favoriteId = req.params.id
        const user_id = req.demoSessionId
        const favorite = await env.soundvaultpublic_db
            .prepare(`SELECT * FROM favorites WHERE id = ? AND demo_session_id = ?`)
            .bind(favoriteId, user_id)
            .first();

        if (!favorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        await env.soundvaultpublic_db
            .prepare('DELETE FROM favorites WHERE id = ? AND demo_session_id = ?')
            .bind(favoriteId, user_id)
            .run();

        res.status(200).json({
            message: 'favorite deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;