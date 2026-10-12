import express from 'express';
import RecordingArtist from '../models/RecordingArtist.js';
import Recording from '../models/Recording.js';
import Artist from '../models/Artist.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';

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

router.post('/', async (req, res) => {
    try {
        const { recording_id, artist_id, role, display_order } = req.body;
        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!artist_id) {
            return res.status(400).json({
                message: 'missing artist id'
            })
        }

        let recordingArtist = {
            recording_id,
            artist_id
        }

        if (role !== undefined) {
            if (role.trim() === '') {
                return res.status(400).json({
                    message: 'provided role cannot be blank'
                })
            }
            recordingArtist.role = role.trim();
        }

        if (display_order !== undefined) {
            if (!/^[1-9]\d*$/.test(display_order)) {
                return res.status(400).json({
                    message: 'invalid display order'
                })
            } else { 
                recordingArtist.display_order = display_order;
            }
        }

        const createdRecordingArtist = await RecordingArtist.create(recordingArtist);

        res.status(201).json(createdRecordingArtist);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

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

router.put('/:id', async (req, res) => {
    try {
        const recordingArtistId = req.params.id
        const foundRecordingArtist = await RecordingArtist.findByPk(recordingArtistId);
        if (!foundRecordingArtist) {
            return res.status(404).json({
                message: 'no recording artist found'
            })
        }
        const { recording_id, artist_id, role, display_order } = req.body;

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!artist_id) {
            return res.status(400).json({
                message: 'missing artist id'
            })
        }

        let recordingArtist = {
            recording_id,
            artist_id
        }

        if (role !== undefined) {
            if (role.trim() === '') {
                return res.status(400).json({
                    message: 'provided role cannot be blank'
                })
            }
            recordingArtist.role = role.trim();
        }

        if (display_order !== undefined) {
            if (!/^[1-9]\d*$/.test(display_order)) {
                return res.status(400).json({
                    message: 'invalid display order'
                })
            } else { 
                recordingArtist.display_order = display_order;
            }
        }

        const updatedRecordingArtist = await foundRecordingArtist.update(recordingArtist);

        res.status(200).json(updatedRecordingArtist);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const recordingArtistId = req.params.id
        const recordingArtist = await RecordingArtist.findByPk(recordingArtistId);
        if (!recordingArtist) {
            return res.status(404).json({
                message: 'no recording artist found'
            })
        }

        await recordingArtist.destroy();

        res.status(200).json({
            message: 'recording artist deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;