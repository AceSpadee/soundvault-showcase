import express from 'express';
import PlaylistItem from '../models/PlaylistItem.js';
import Playlist from '../models/Playlist.js';
import Recording from '../models/Recording.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const playlistItem = await PlaylistItem.findAll({
            order: [['position', 'ASC']],
            include: [
                {
                    model: Playlist,
                    where: {
                        user_id: req.user.id
                    }, 
                },
                {
                    model: Recording,
                    include: [
                        {
                            model: Song,
                            include: [
                                {
                                    model: Artist
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        res.status(200).json(playlistItem);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', requireAuth, async (req, res) => {
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

        let playlistItem = {}

        if (!/^[1-9]\d*$/.test(playlist_id)) {
            return res.status(400).json({
                message: 'invalid playlist id'
            })
        } else { 
            playlistItem.playlist_id = playlist_id;
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        } else { 
            playlistItem.recording_id = recording_id;
        }

        if (!/^[1-9]\d*$/.test(position)) {
            return res.status(400).json({
                message: 'invalid position'
            })
        } else { 
            playlistItem.position = position;
        }
        const positionCount = await PlaylistItem.count({
            where: {
                playlist_id: playlist_id
            }
        });

        if (Number(position) !== positionCount + 1) {
            return res.status(400).json({
                message: 'invalid position'
            })
        }

        const playlistExists = await Playlist.findOne({
            where: {
                id: playlist_id,
                user_id: req.user.id
            }
        })

        if (!playlistExists) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        const createdPlaylistItem = await PlaylistItem.create(playlistItem);

        const playlistItemData = await PlaylistItem.findOne({
            where: { id: createdPlaylistItem.id },
            include: [
                {
                    model: Playlist,
                    where: {
                        user_id: req.user.id
                    }, 
                },
                {
                    model: Recording,
                    include: [
                        {
                            model: Song,
                            include: [
                                {
                                    model: Artist
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        res.status(201).json(playlistItemData);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const playlistItemId = req.params.id
        const playlistItem = await PlaylistItem.findOne({
            where: {
                id: playlistItemId
            },
            include: [
                {
                    model: Playlist,
                    where: {
                        user_id: req.user.id
                    }
                },
                Recording
            ]
        });

        if (!playlistItem) {
            return res.status(404).json({
                message: 'no playlist item found'
            })
        }

        res.status(200).json(playlistItem);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const playlistItemId = req.params.id
        const foundPlaylistItem = await PlaylistItem.findOne({
            where: {
                id: playlistItemId,
            },
            include: [
                {
                    model: Playlist,
                    where: {
                        user_id: req.user.id
                    }
                }
            ]
        });

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

        let playlistItem = {}

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
        } else { 
            playlistItem.recording_id = recording_id;
        }
        const positionCount = await PlaylistItem.count({
            where: {
                playlist_id: foundPlaylistItem.playlist_id
            }
        });

        if (!/^[1-9]\d*$/.test(position)) {
            return res.status(400).json({
                message: 'invalid position'
            })
        } else if (position > positionCount) {
            return res.status(400).json({
                message: 'invalid position number'
            })
        }

        const playlistExists = await Playlist.findOne({
            where: {
                id: foundPlaylistItem.playlist_id,
                user_id: req.user.id
            }
        })

        if (!playlistExists) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }
        
        const isPlaylistItemPosition = await PlaylistItem.findOne({
            where: {
                playlist_id: foundPlaylistItem.playlist_id,
                position: position
            }
        })

        const oldPosition = foundPlaylistItem.position

        if (isPlaylistItemPosition) {
            await isPlaylistItemPosition.update({position: oldPosition})
        }
        playlistItem.position = position;

        const updatedPlaylistItem = await foundPlaylistItem.update(playlistItem);

        res.status(200).json(updatedPlaylistItem);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const playlistItemId = req.params.id
        const playlistItem = await PlaylistItem.findOne({
            where: {
                id: playlistItemId
            },
            include: [
                {
                    model: Playlist,
                    where: {
                        user_id: req.user.id
                    }, 
                },
                Recording
            ]
        });

        if (!playlistItem) {
            return res.status(404).json({
                message: 'no playlist item found'
            })
        }

        await playlistItem.destroy();

        const remainingPlaylistItems = await PlaylistItem.findAll({
            where: {
                playlist_id: playlistItem.playlist_id
            },
            order: [['position', 'ASC']]
        })

        let count = 1
        for (const item of remainingPlaylistItems) {
            await item.update({
                position: count
            });
            count++
        }

        res.status(200).json({
            message: 'playlist item deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;