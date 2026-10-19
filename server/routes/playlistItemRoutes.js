import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const playlistItems = await env.soundvaultpublic_db
            .prepare(`SELECT playlist_items.*,
                playlists.id AS playlist_id_alias,
                playlists.demo_session_id AS playlist_session_id,
                playlists.name AS playlist_name,
                playlists.created_at AS playlist_created_at,
                playlists.updated_at AS playlist_updated_at,
                recordings.id AS recording_id_alias,
                recordings.song_id AS recording_song_id,
                recordings.version AS recording_version,
                recordings.musicbrainz_id AS recording_musicbrainz_id,
                recordings.audio_url AS recording_audio_url,
                recordings.duration AS recording_duration,
                recordings.created_at AS recording_created_at,
                recordings.updated_at AS recording_updated_at,
                songs.id AS song_id_alias,
                songs.title AS song_title,
                songs.primary_artist_id AS song_primary_artist_id,
                songs.created_at AS song_created_at,
                songs.updated_at AS song_updated_at,
                artists.id AS artist_id_alias,
                artists.name AS artist_name,
                artists.musicbrainz_id AS artist_musicbrainz_id,
                artists.created_at AS artist_created_at,
                artists.updated_at AS artist_updated_at
                FROM playlist_items
                JOIN playlists 
                ON playlist_items.playlist_id = playlists.id
                JOIN recordings
                ON playlist_items.recording_id = recordings.id
                JOIN songs
                ON recordings.song_id = songs.id
                JOIN artists
                ON songs.primary_artist_id = artists.id
                WHERE playlists.demo_session_id = ?
                ORDER BY playlist_items.position ASC`)
            .bind(req.demoSessionId)
            .all()

        const formattedPlaylistItems = playlistItems.results.map((item) => {
            const { 
                playlist_id_alias, 
                playlist_session_id, 
                playlist_name, 
                playlist_created_at, 
                playlist_updated_at, 
                recording_id_alias,
                recording_song_id,
                recording_version,
                recording_musicbrainz_id,
                recording_audio_url,
                recording_duration,
                recording_created_at,
                recording_updated_at,
                song_id_alias,
                song_title,
                song_primary_artist_id,
                song_created_at,
                song_updated_at,
                artist_id_alias,
                artist_name,
                artist_musicbrainz_id,
                artist_created_at,
                artist_updated_at,
                ...remainingFields 
            } = item

            return {
                ...remainingFields,
                "Playlist": {
                    id: playlist_id_alias, 
                    demo_session_id: playlist_session_id, 
                    name: playlist_name, 
                    created_at: playlist_created_at, 
                    updated_at: playlist_updated_at
                },
                "Recording": {
                    id: recording_id_alias,
                    song_id: recording_song_id,
                    version: recording_version,
                    musicbrainz_id: recording_musicbrainz_id,
                    audio_url: recording_audio_url,
                    duration: recording_duration,
                    created_at: recording_created_at, 
                    updated_at: recording_updated_at,
                    "Song": {
                        id: song_id_alias,
                        title: song_title,
                        primary_artist_id: song_primary_artist_id,
                        created_at: song_created_at,
                        updated_at: song_updated_at,
                        "Artist": {
                            id: artist_id_alias,
                            name: artist_name,
                            musicbrainz_id: artist_musicbrainz_id,
                            created_at: artist_created_at,
                            updated_at: artist_updated_at
                        }
                    }
                }
            }
        })

        res.status(200).json(formattedPlaylistItems);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { playlist_id, recording_id, position } = req.body;
        if (!playlist_id) {
            return res.status(400).json({
                message: 'missing playlist id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!position) {
            return res.status(400).json({
                message: 'missing position'
            })
        }

        if (!/^[1-9]\d*$/.test(playlist_id)) {
            return res.status(400).json({
                message: 'invalid playlist id'
            })
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        }

        if (!/^[1-9]\d*$/.test(position)) {
            return res.status(400).json({
                message: 'invalid position'
            })
        }

        const itemCount = await env.soundvaultpublic_db
            .prepare('SELECT COUNT(*) AS itemCount FROM playlist_items WHERE playlist_id = ?')
            .bind(playlist_id)
            .first()

        if (Number(position) !== itemCount.itemCount + 1) {
            return res.status(400).json({
                message: 'invalid position'
            })
        }

        const playlistExists = await env.soundvaultpublic_db
            .prepare('SELECT * FROM playlists WHERE id = ? AND demo_session_id = ?')
            .bind(playlist_id, req.demoSessionId)
            .first()

        if (!playlistExists) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        const createdPlaylistItem = await env.soundvaultpublic_db
            .prepare(`INSERT INTO playlist_items (playlist_id, recording_id, position) 
                SELECT id, ?, ? 
                FROM playlists 
                WHERE id = ? AND demo_session_id = ?
                AND ? = (
                    SELECT COUNT(*) + 1
                    FROM playlist_items
                    WHERE playlist_id = playlists.id
                )
                RETURNING *`)
            .bind(recording_id, position, playlist_id, req.demoSessionId, position)
            .first()

        if (!createdPlaylistItem) {
            return res.status(400).json({
                message: "unable to add playlist item"
            })
        }

        const playlistItemData = await env.soundvaultpublic_db
            .prepare(`SELECT playlist_items.*,
                playlists.id AS playlist_id_alias,
                playlists.demo_session_id AS playlist_session_id,
                playlists.name AS playlist_name,
                playlists.created_at AS playlist_created_at,
                playlists.updated_at AS playlist_updated_at,
                recordings.id AS recording_id_alias,
                recordings.song_id AS recording_song_id,
                recordings.version AS recording_version,
                recordings.musicbrainz_id AS recording_musicbrainz_id,
                recordings.audio_url AS recording_audio_url,
                recordings.duration AS recording_duration,
                recordings.created_at AS recording_created_at,
                recordings.updated_at AS recording_updated_at,
                songs.id AS song_id_alias,
                songs.title AS song_title,
                songs.primary_artist_id AS song_primary_artist_id,
                songs.created_at AS song_created_at,
                songs.updated_at AS song_updated_at,
                artists.id AS artist_id_alias,
                artists.name AS artist_name,
                artists.musicbrainz_id AS artist_musicbrainz_id,
                artists.created_at AS artist_created_at,
                artists.updated_at AS artist_updated_at
                FROM playlist_items
                JOIN playlists
                ON playlist_items.playlist_id = playlists.id
                JOIN recordings
                ON playlist_items.recording_id = recordings.id
                JOIN songs
                ON recordings.song_id = songs.id
                JOIN artists
                ON songs.primary_artist_id = artists.id
                WHERE playlist_items.id = ?
                AND playlists.demo_session_id = ?`)
            .bind(createdPlaylistItem.id, req.demoSessionId)
            .first()

        const { 
            playlist_id_alias, 
            playlist_session_id, 
            playlist_name, 
            playlist_created_at, 
            playlist_updated_at, 
            recording_id_alias,
            recording_song_id,
            recording_version,
            recording_musicbrainz_id,
            recording_audio_url,
            recording_duration,
            recording_created_at,
            recording_updated_at,
            song_id_alias,
            song_title,
            song_primary_artist_id,
            song_created_at,
            song_updated_at,
            artist_id_alias,
            artist_name,
            artist_musicbrainz_id,
            artist_created_at,
            artist_updated_at,
            ...remainingFields 
        } = playlistItemData

        const formattedPlaylistItems = {
            ...remainingFields,
            "Playlist": {
                id: playlist_id_alias, 
                demo_session_id: playlist_session_id, 
                name: playlist_name, 
                created_at: playlist_created_at, 
                updated_at: playlist_updated_at
            },
            "Recording": {
                id: recording_id_alias,
                song_id: recording_song_id,
                version: recording_version,
                musicbrainz_id: recording_musicbrainz_id,
                audio_url: recording_audio_url,
                duration: recording_duration,
                created_at: recording_created_at, 
                updated_at: recording_updated_at,
                "Song": {
                    id: song_id_alias,
                    title: song_title,
                    primary_artist_id: song_primary_artist_id,
                    created_at: song_created_at,
                    updated_at: song_updated_at,
                    "Artist": {
                        id: artist_id_alias,
                        name: artist_name,
                        musicbrainz_id: artist_musicbrainz_id,
                        created_at: artist_created_at,
                        updated_at: artist_updated_at
                    }
                }
            }
        }

        res.status(201).json(formattedPlaylistItems);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const playlistItemId = req.params.id
        const playlistItem = await env.soundvaultpublic_db
            .prepare(`SELECT playlist_items.*,
                playlists.id AS playlist_id_alias,
                playlists.demo_session_id AS playlist_session_id,
                playlists.name AS playlist_name,
                playlists.created_at AS playlist_created_at,
                playlists.updated_at AS playlist_updated_at,
                recordings.id AS recording_id_alias,
                recordings.song_id AS recording_song_id,
                recordings.version AS recording_version,
                recordings.musicbrainz_id AS recording_musicbrainz_id,
                recordings.audio_url AS recording_audio_url,
                recordings.duration AS recording_duration,
                recordings.created_at AS recording_created_at,
                recordings.updated_at AS recording_updated_at,
                songs.id AS song_id_alias,
                songs.title AS song_title,
                songs.primary_artist_id AS song_primary_artist_id,
                songs.created_at AS song_created_at,
                songs.updated_at AS song_updated_at,
                artists.id AS artist_id_alias,
                artists.name AS artist_name,
                artists.musicbrainz_id AS artist_musicbrainz_id,
                artists.created_at AS artist_created_at,
                artists.updated_at AS artist_updated_at
                FROM playlist_items
                JOIN playlists
                ON playlist_items.playlist_id = playlists.id
                JOIN recordings
                ON playlist_items.recording_id = recordings.id
                JOIN songs
                ON recordings.song_id = songs.id
                JOIN artists
                ON songs.primary_artist_id = artists.id
                WHERE playlist_items.id = ? AND playlists.demo_session_id = ?`)
            .bind(playlistItemId, req.demoSessionId)
            .first()

        if (!playlistItem) {
            return res.status(404).json({
                message: 'no playlist item found'
            })
        }

        const { 
            playlist_id_alias, 
            playlist_session_id, 
            playlist_name, 
            playlist_created_at, 
            playlist_updated_at, 
            recording_id_alias,
            recording_song_id,
            recording_version,
            recording_musicbrainz_id,
            recording_audio_url,
            recording_duration,
            recording_created_at,
            recording_updated_at,
            song_id_alias,
            song_title,
            song_primary_artist_id,
            song_created_at,
            song_updated_at,
            artist_id_alias,
            artist_name,
            artist_musicbrainz_id,
            artist_created_at,
            artist_updated_at,
            ...remainingFields 
        } = playlistItem

        const formattedPlaylistItems = {
            ...remainingFields,
            "Playlist": {
                id: playlist_id_alias, 
                demo_session_id: playlist_session_id, 
                name: playlist_name, 
                created_at: playlist_created_at, 
                updated_at: playlist_updated_at
            },
            "Recording": {
                id: recording_id_alias,
                song_id: recording_song_id,
                version: recording_version,
                musicbrainz_id: recording_musicbrainz_id,
                audio_url: recording_audio_url,
                duration: recording_duration,
                created_at: recording_created_at, 
                updated_at: recording_updated_at,
                "Song": {
                    id: song_id_alias,
                    title: song_title,
                    primary_artist_id: song_primary_artist_id,
                    created_at: song_created_at,
                    updated_at: song_updated_at,
                    "Artist": {
                        id: artist_id_alias,
                        name: artist_name,
                        musicbrainz_id: artist_musicbrainz_id,
                        created_at: artist_created_at,
                        updated_at: artist_updated_at
                    }
                }
            }
        }

        res.status(200).json(formattedPlaylistItems);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const playlistItemId = req.params.id;
        const foundPlaylistItem = await env.soundvaultpublic_db
            .prepare(`SELECT playlist_items.*
                FROM playlist_items
                JOIN playlists
                ON playlist_items.playlist_id = playlists.id
                WHERE playlist_items.id = ? AND playlists.demo_session_id = ?`)
            .bind(playlistItemId, req.demoSessionId)
            .first()

        if (!foundPlaylistItem) {
            return res.status(404).json({
                message: 'no playlist item found'
            })
        }
        
        const { playlist_id, recording_id, position } = req.body;
        if (!playlist_id) {
            return res.status(400).json({
                message: 'missing playlist id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!position) {
            return res.status(400).json({
                message: 'missing position'
            })
        }

        if (!/^[1-9]\d*$/.test(playlist_id)) {
            return res.status(400).json({
                message: 'invalid playlist id'
            })
        }
        if (Number(playlist_id) !== foundPlaylistItem.playlist_id) {
            return res.status(404).json({
                message: 'playlist id doesnt match'
            })
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        }

        const positionCount = await env.soundvaultpublic_db
            .prepare(`SELECT COUNT(*) AS itemCount FROM playlist_items WHERE playlist_id = ?`)
            .bind(playlist_id)
            .first()

        if (!/^[1-9]\d*$/.test(position)) {
            return res.status(400).json({
                message: 'invalid position'
            })
        } else if (Number(position) > positionCount.itemCount) {
            return res.status(400).json({
                message: 'invalid position number'
            })
        }

        const playlistExists = await env.soundvaultpublic_db
            .prepare('SELECT * FROM playlists WHERE id = ? AND demo_session_id = ?')
            .bind(playlist_id, req.demoSessionId)
            .first()

        if (!playlistExists) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }
        
        const isPlaylistItemPosition = await env.soundvaultpublic_db
            .prepare('SELECT * FROM playlist_items WHERE playlist_id = ? AND position = ?')
            .bind(playlist_id, position)
            .first()

        const oldPosition = foundPlaylistItem.position

        const statements = [];

        if (isPlaylistItemPosition && isPlaylistItemPosition.id !== foundPlaylistItem.id) {
            const first = await env.soundvaultpublic_db
                .prepare(`UPDATE playlist_items SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND playlist_id = ?`)
                .bind(oldPosition, isPlaylistItemPosition.id, playlist_id)

            statements.push(first)
        }

        const updatedPlaylistItem = await env.soundvaultpublic_db
            .prepare(`UPDATE playlist_items 
                SET position = ?, recording_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND playlist_id = ?
                RETURNING *`)
            .bind(position, recording_id, foundPlaylistItem.id, playlist_id)
        statements.push(updatedPlaylistItem)

        const results = await env.soundvaultpublic_db.batch(statements);

        res.status(200).json(results.at(-1).results[0]);
    } catch (error) {
        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const playlistItemId = req.params.id
        const playlistItem = await env.soundvaultpublic_db
            .prepare(`SELECT playlist_items.*
                FROM playlist_items
                JOIN playlists
                ON playlist_items.playlist_id = playlists.id
                WHERE playlist_items.id = ? AND playlists.demo_session_id = ?`)
            .bind(playlistItemId, req.demoSessionId)
            .first()

        if (!playlistItem) {
            return res.status(404).json({
                message: 'no playlist item found'
            })
        }

        const remainingPlaylistItems = await env.soundvaultpublic_db
            .prepare(`SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY position ASC`)
            .bind(playlistItem.playlist_id)
            .all()

        const statements = []

        const first = await env.soundvaultpublic_db
            .prepare('DELETE FROM playlist_items WHERE id = ? AND playlist_id = ?')
            .bind(playlistItemId, playlistItem.playlist_id)
        statements.push(first)

        let count = 1
        for (const item of remainingPlaylistItems.results) {
            if (item.id === playlistItem.id) {
                continue;
            }

            const second = await env.soundvaultpublic_db
                .prepare(`UPDATE playlist_items 
                    SET position = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? AND playlist_id = ?`)
                .bind(count, item.id, playlistItem.playlist_id)
                statements.push(second)
            count++
        }

        await env.soundvaultpublic_db.batch(statements);

        res.status(200).json({
            message: 'playlist item deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;