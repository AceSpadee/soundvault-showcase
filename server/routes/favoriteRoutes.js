import express from 'express';
import Favorite from '../models/Favorite.js';
import User from '../models/User.js';
import Recording from '../models/Recording.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const favorite = await Favorite.findAll({
            where: {
                user_id: req.user.id
            },
            include: [
                {
                    model: User, 
                    attributes: {
                        exclude: ['password_hash']
                    }
                },
                Recording
            ]
        });

        res.status(200).json(favorite);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { recording_id } = req.body;
        const user_id = req.user.id;
        if (!user_id) {
            return res.status(400).json({
                message: 'missing user id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        }

        let favorite = {}
        
        if (!/^[1-9]\d*$/.test(user_id)) {
            return res.status(400).json({
                message: 'invalid user id'
            })
        } else { 
            favorite.user_id = user_id;
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        } else { 
            favorite.recording_id = recording_id;
        }

        const isFavorite = await Favorite.findOne({
            where: {
                user_id: user_id,
                recording_id: recording_id
            }
        })

        if (isFavorite) {
            return res.status(409).json({
                message: 'recording already favorited'
            })
        }

        const createdFavorite = await Favorite.create(favorite);

        res.status(201).json(createdFavorite);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const favoriteId = req.params.id
        const favorite = await Favorite.findByPk(favoriteId, {
            where: {
                user_id: req.user.id
            },
            include: [
                {
                    model: User, 
                    attributes: {
                        exclude: ['password_hash']
                    }
                },
                Recording
            ]
        });

        if (!favorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        res.status(200).json(favorite);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const favoriteId = req.params.id
        const { recording_id } = req.body;
        const user_id = req.user.id;
        const foundFavorite = await Favorite.findOne({
            where: {
                id: favoriteId,
                user_id: user_id
            }
        });

        if (!foundFavorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        if (!user_id) {
            return res.status(400).json({
                message: 'missing user id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        }

        let favorite = {}
        
        if (!/^[1-9]\d*$/.test(user_id)) {
            return res.status(400).json({
                message: 'invalid user id'
            })
        } else { 
            favorite.user_id = user_id;
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        } else { 
            favorite.recording_id = recording_id;
        }

        const isFavorite = await Favorite.findOne({
            where: {
                user_id: user_id,
                recording_id: recording_id
            }
        })

        if (isFavorite && isFavorite.id !== foundFavorite.id) {
            return res.status(409).json({
                message: 'recording already favorited'
            })
        }

        const updatedFavorite = await foundFavorite.update(favorite);

        res.status(200).json(updatedFavorite);
    } catch (error) {

        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }
        serverError(res, error);
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const favoriteId = req.params.id
        const userId = req.user.id
        const favorite = await Favorite.findOne({
            where: {
                id: favoriteId,
                user_id: userId
            }
        });

        if (!favorite) {
            return res.status(404).json({
                message: 'no favorite found'
            })
        }

        await favorite.destroy();

        res.status(200).json({
            message: 'favorite deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;