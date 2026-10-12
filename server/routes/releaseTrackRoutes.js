import express from 'express';
import ReleaseTrack from '../models/ReleaseTrack.js';
import Release from '../models/Release.js';
import Recording from '../models/Recording.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';

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

router.post('/', async (req, res) => {
    try {
        const { release_id, recording_id, disc_number, track_number } = req.body;
        if (!release_id) {
            return res.status(400).json({
                message: 'missing release id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!track_number) {
            return res.status(400).json({
                message: 'missing track number'
            })
        }

        let releaseTrack = {
            release_id,
            recording_id
        }

        if (!/^[1-9]\d*$/.test(track_number)) {
            return res.status(400).json({
                message: 'invalid track number'
            })
        } else { 
            releaseTrack.track_number = track_number;
        }

        if (disc_number !== undefined) {
            if (!/^[1-9]\d*$/.test(disc_number)) {
                return res.status(400).json({
                    message: 'invalid disc number'
                })
            } else { 
                releaseTrack.disc_number = disc_number;
            }
        }

        const createdReleaseTrack = await ReleaseTrack.create(releaseTrack);

        res.status(201).json(createdReleaseTrack);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

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

router.put('/:id', async (req, res) => {
    try {
        const releaseTrackId = req.params.id;
        const foundReleaseTrack = await ReleaseTrack.findByPk(releaseTrackId);
        if (!foundReleaseTrack) {
            return res.status(404).json({
                message: 'release track not found'
            })
        }

        const { release_id, recording_id, disc_number, track_number } = req.body;
        if (!release_id) {
            return res.status(400).json({
                message: 'missing release id'
            })
        } else if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!track_number) {
            return res.status(400).json({
                message: 'missing track number'
            })
        }

        let releaseTrack = {
            release_id,
            recording_id
        }

        if (!/^[1-9]\d*$/.test(track_number)) {
            return res.status(400).json({
                message: 'invalid track number'
            })
        } else { 
            releaseTrack.track_number = track_number;
        }

        if (disc_number !== undefined) {
            if (!/^[1-9]\d*$/.test(disc_number)) {
                return res.status(400).json({
                    message: 'invalid disc number'
                })
            } else { 
                releaseTrack.disc_number = disc_number;
            }
        }

        const updatedReleaseTrack = await foundReleaseTrack.update(releaseTrack)

        res.status(200).json(updatedReleaseTrack);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const releaseTrackId = req.params.id;
        const releaseTrack = await ReleaseTrack.findByPk(releaseTrackId);
        if (!releaseTrack) {
            return res.status(404).json({
                message: 'release track not found'
            })
        }

        await releaseTrack.destroy();

        res.status(200).json({
            message: 'release track deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;