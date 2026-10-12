import express from 'express';
import MetadataMatch from '../models/MetadataMatch.js';
import AudioFile from '../models/AudioFile.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import { processUnmatchedMetadataMatches } from '../services/metadataMatchingService.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
    try {
        const metadataMatch = await MetadataMatch.findAll({
            include: AudioFile
        });

        res.status(200).json(metadataMatch);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { audio_file_id, provider, external_id, confidence, status } = req.body;

        let metadataMatch = {}

        if (!audio_file_id) {
            return res.status(400).json({
                message: 'missing audio file id'
            })
        } else if (!/^[1-9]\d*$/.test(audio_file_id)) {
            return res.status(400).json({
                message: 'invalid audio file id'
            })
        } else { 
            metadataMatch.audio_file_id = audio_file_id;
        }

        if (typeof provider !== "string") {
            return res.status(400).json({
                message: 'provider must be string'
            })
        } else if (provider.trim() === '') {
            return res.status(400).json({
                message: 'provider cannot be blank'
            })
        } else {
            metadataMatch.provider = provider.trim();
        }

        if (external_id !== undefined) {
            if (external_id === null) {
                metadataMatch.external_id = null
            } else if (typeof external_id !== "string") {
                return res.status(400).json({
                    message: 'external id must be string'
                })
            } else if (external_id.trim() === '') {
                metadataMatch.external_id = null
            } else {
                metadataMatch.external_id = external_id.trim();
            }
        }
        if (confidence !== undefined) {
            if (confidence !== null) {
                if (typeof confidence !== "number")  {
                    return res.status(400).json({
                        message: 'confidence must be number'
                    })
                } else if (!Number.isInteger(confidence)) {
                    return res.status(400).json({
                        message: 'confidence must be between 0 and 100'
                    })
                } else if (confidence < 0 || confidence > 100) {
                    return res.status(400).json({
                        message: 'confidence must be between 0 and 100'
                    })
                }
            }
            metadataMatch.confidence = confidence;
        }
        if (status !== undefined) {
            if (typeof status !== "string") {
                return res.status(400).json({
                    message: 'status must be string'
                })
            } else if (status.trim() === '') {
                return res.status(400).json({
                    message: 'provided status cannot be blank'
                })
            }
            metadataMatch.status = status.trim();
        }

        const createdMetadataMatch = await MetadataMatch.create(metadataMatch);

        res.status(201).json(createdMetadataMatch);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.post('/match-unmatched', async (req, res) => {
    try {
        const processUnmatchedMetadata = await processUnmatchedMetadataMatches();

        const results = processUnmatchedMetadata.map((metadataMatch) => {
            if (!metadataMatch) {
                return null;
            }
            if (metadataMatch.status === "ERROR") {
                return {
                    id: metadataMatch.id,
                    status: "ERROR",
                    error: metadataMatch.error
                }
            }

            return {
                "id": metadataMatch.id,
                "status": metadataMatch.status,
                "external_id": metadataMatch.external_id,
                "confidence": metadataMatch.confidence
            }
        })

        return res.status(200).json(results);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const metadataMatchId = req.params.id;
        const metadataMatch = await MetadataMatch.findByPk(metadataMatchId, {
            include: AudioFile
        });

        if (!metadataMatch) {
            return res.status(404).json({
                message: 'no metadata match found'
            })
        }

        res.status(200).json(metadataMatch);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const metadataMatchId = req.params.id;
        const foundMetadataMatch = await MetadataMatch.findByPk(metadataMatchId);

        if (!foundMetadataMatch) {
            return res.status(404).json({
                message: 'no metadata match found'
            })
        }

        const { audio_file_id, provider, external_id, confidence, status } = req.body;

        let metadataMatch = {}

        if (!audio_file_id) {
            return res.status(400).json({
                message: 'missing audio file id'
            })
        } else if (!/^[1-9]\d*$/.test(audio_file_id)) {
            return res.status(400).json({
                message: 'invalid audio file id'
            })
        } else { 
            metadataMatch.audio_file_id = audio_file_id;
        }

        if (typeof provider !== "string") {
            return res.status(400).json({
                message: 'provider must be string'
            })
        } else if (provider.trim() === '') {
            return res.status(400).json({
                message: 'provider cannot be blank'
            })
        } else {
            metadataMatch.provider = provider.trim();
        }

        if (external_id !== undefined) {
            if (external_id === null) {
                metadataMatch.external_id = null
            } else if (typeof external_id !== "string") {
                return res.status(400).json({
                    message: 'external id must be string'
                })
            } else if (external_id.trim() === '') {
                metadataMatch.external_id = null
            } else {
                metadataMatch.external_id = external_id.trim();
            }
        }
        if (confidence !== undefined) {
            if (confidence !== null) {
                if (typeof confidence !== "number")  {
                    return res.status(400).json({
                        message: 'confidence must be number'
                    })
                } else if (!Number.isInteger(confidence)) {
                    return res.status(400).json({
                        message: 'confidence must be between 0 and 100'
                    })
                } else if (confidence < 0 || confidence > 100) {
                    return res.status(400).json({
                        message: 'confidence must be between 0 and 100'
                    })
                }
            }
            metadataMatch.confidence = confidence;
        }
        if (status !== undefined) {
            if (typeof status !== "string") {
                return res.status(400).json({
                    message: 'status must be string'
                })
            } else if (status.trim() === '') {
                return res.status(400).json({
                    message: 'provided status cannot be blank'
                })
            }
            metadataMatch.status = status.trim();
        }

        const createdMetadataMatch = await foundMetadataMatch.update(metadataMatch);

        res.status(200).json(createdMetadataMatch);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const metadataMatchId = req.params.id;
        const metadataMatch = await MetadataMatch.findByPk(metadataMatchId);

        if (!metadataMatch) {
            return res.status(404).json({
                message: 'no metadata match found'
            })
        }

        await metadataMatch.destroy();

        res.status(200).json({
            message: 'metadata match deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;