import express from 'express';
import Playlist from '../models/Playlist.js';
import User from '../models/User.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const playlist = await Playlist.findAll({
            where: {
                user_id: req.user.id
            },
            include: {
                model: User,
                attributes: {
                    exclude: ['password_hash']
                }
            }
        });

        res.status(200).json(playlist);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        const user_id = req.user.id;

        let playlist = {}

        if (!user_id) {
            return res.status(400).json({
                message: 'missing user id'
            })
        } else if (!/^[1-9]\d*$/.test(user_id)) {
            return res.status(400).json({
                message: 'invalid user id'
            })
        } else { 
            playlist.user_id = user_id;
        }

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (name.trim() === '') {
            return res.status(400).json({
                message: 'missing playlist name'
            })
        } else {
            playlist.name = name.trim();
        }

        const createdPlaylist = await Playlist.create(playlist);

        res.status(201).json(createdPlaylist);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.user.id;
        const playlist = await Playlist.findOne({
            where: {
                id: playlistId,
                user_id: user_id
            },
            include: {
                model: User,
                attributes: {
                    exclude: ['password_hash']
                }
            }
        });
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

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.user.id;
        const foundPlaylist = await Playlist.findOne({
            where: {
                id: playlistId,
                user_id: user_id
            }
        });
        if (!foundPlaylist) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        const { name } = req.body;

        let playlist = {}

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (name.trim() === '') {
            return res.status(400).json({
                message: 'missing playlist name'
            })
        } else {
            playlist.name = name.trim();
        }

        const updatedPlaylist = await foundPlaylist.update(playlist);

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const user_id = req.user.id;
        const playlist = await Playlist.findOne({
            where: {
                id: playlistId,
                user_id: user_id
            }
        });
        if (!playlist) {
            return res.status(404).json({
                message: 'no playlist found'
            })
        }

        await playlist.destroy();

        res.status(200).json({
            message: 'playlist deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;