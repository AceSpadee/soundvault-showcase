import express from 'express';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const song = await Song.findAll({
            include: [Artist]
        });

        res.status(200).json(song);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const songId = req.params.id

        const song = await Song.findByPk(songId, {
            include: [Artist]
        });
        if (!song) {
            return res.status(404).json({
                message: 'no song found'
            })
        }

        res.status(200).json(song);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;