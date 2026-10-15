import express from 'express';
import Release from '../models/Release.js';
import Album from '../models/Album.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const release = await Release.findAll({
            include: [Album]
        });

        res.status(200).json(release);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const releaseId = req.params.id;

        const release = await Release.findByPk(releaseId, {
            include: [Album]
        });
        if (!release) {
            return res.status(404).json({
                message: 'release not found'
            })
        }

        res.status(200).json(release);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;