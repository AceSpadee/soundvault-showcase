import express from 'express';
import Artist from '../models/Artist.js';
import Song from '../models/Song.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const artists = await Artist.findAll();

        res.status(200).json(artists);
    } catch (error) {
        serverError(res, error);
    };
});

router.get('/:id', async (req, res) => {
    try {
        const artistId = req.params.id

        const artist = await Artist.findByPk(artistId, {
            include: [Song]
        });
        if (!artist) {
            return res.status(404).json({
                message: 'no artist found'
            })
        };

        res.status(200).json(artist);
    } catch (error) {
        serverError(res, error);
    };
});

export default router;