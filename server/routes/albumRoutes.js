import express from 'express';
import Album from '../models/Album.js';
import Artist from '../models/Artist.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const album = await Album.findAll({
            include: [Artist]
        });

        res.status(200).json(album);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const albumId = req.params.id

        const album = await Album.findByPk(albumId, {
            include: [Artist]
        });
        if (!album) {
            return res.status(404).json({
                message: 'missing album'
            })
        }

        res.status(200).json(album);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;