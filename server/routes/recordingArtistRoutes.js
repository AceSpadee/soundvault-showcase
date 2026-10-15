import express from 'express';
import RecordingArtist from '../models/RecordingArtist.js';
import Recording from '../models/Recording.js';
import Artist from '../models/Artist.js';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const recordingArtist = await RecordingArtist.findAll({
            include: [Recording, Artist]
        });

        res.status(200).json(recordingArtist);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recordingArtistId = req.params.id
        const recordingArtist = await RecordingArtist.findByPk(recordingArtistId, {
            include: [Recording, Artist]
        });
        if (!recordingArtist) {
            return res.status(404).json({
                message: 'no recording artist found'
            })
        }

        res.status(200).json(recordingArtist);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;