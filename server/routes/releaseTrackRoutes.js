import express from 'express';
import ReleaseTrack from '../models/ReleaseTrack.js';
import Release from '../models/Release.js';
import Recording from '../models/Recording.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const releaseTrack = await ReleaseTrack.findAll({
            include: [Release, Recording]
        });

        res.status(200).json(releaseTrack);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const releaseTrackId = req.params.id;
        const releaseTrack = await ReleaseTrack.findByPk(releaseTrackId, {
            include: [Release, Recording]
        });
        if (!releaseTrack) {
            return res.status(404).json({
                message: 'release track not found'
            })
        }

        res.status(200).json(releaseTrack);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;