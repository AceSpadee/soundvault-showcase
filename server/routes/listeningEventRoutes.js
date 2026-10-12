import express from 'express';
import ListeningEvent from '../models/ListeningEvent.js';
import User from '../models/User.js';
import Recording from '../models/Recording.js';
import AudioFile from '../models/AudioFile.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const listeningEvent = await ListeningEvent.findAll({
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
                Recording,
                AudioFile
            ]
        });

        res.status(200).json(listeningEvent);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { recording_id, audio_file_id, started_at, ended_at, seconds_listened, completed, skipped } = req.body;
        const user_id = req.user.id;

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!audio_file_id) {
            return res.status(400).json({
                message: 'missing audio file id'
            })
        } else if (!started_at) {
            return res.status(400).json({
                message: 'missing started at'
            })
        }

        let listeningEvent = {}

        listeningEvent.user_id = user_id;

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        } else { 
            listeningEvent.recording_id = recording_id;
        }

        if (!/^[1-9]\d*$/.test(audio_file_id)) {
            return res.status(400).json({
                message: 'invalid audio file id'
            })
        } else { 
            listeningEvent.audio_file_id = audio_file_id;
        }

        const parsedStartTime = Date.parse(started_at);
        if (isNaN(parsedStartTime)) {
            return res.status(400).json({
                message: 'invalid started at'
            })
        }
        listeningEvent.started_at = started_at;

        if (ended_at !== undefined) {
            if (ended_at !== null) {
                const parsedEndTime = Date.parse(ended_at);
                if (isNaN(parsedEndTime)) {
                    return res.status(400).json({
                        message: 'invalid ended at'
                    })
                }
                if (parsedEndTime < parsedStartTime) {
                    return res.status(400).json({
                        message: 'invalid ended at time'
                    })
                }
            }
            listeningEvent.ended_at = ended_at;
        }
        if (seconds_listened !== undefined) {
            if (typeof seconds_listened !== "number")  {
                    return res.status(400).json({
                        message: 'seconds listened must be number'
                    })
                } else if (!Number.isInteger(seconds_listened)) {
                    return res.status(400).json({
                        message: 'seconds listened must be number'
                    })
                } else if (seconds_listened < 0) {
                    return res.status(400).json({
                        message: 'seconds listened must be 0 or greater'
                    })
                }
            listeningEvent.seconds_listened = seconds_listened;
        }
        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: 'completed must be boolean'
                })
            }
            listeningEvent.completed = completed;
        }
        if (skipped !== undefined) {
            if (typeof skipped !== "boolean") {
                return res.status(400).json({
                    message: 'skipped must be boolean'
                })
            }
            listeningEvent.skipped = skipped;
        }

        const isAudioFile = await AudioFile.findOne({
            where: {
                id: audio_file_id
            }
        })
        if (!isAudioFile) {
            return res.status(400).json({
                message: 'audio file not found'
            })
        }

        if (isAudioFile.recording_id !== Number(recording_id)) {
            return res.status(400).json({
                message: 'audio file does not belong to recording'
            })
        }

        const createdListeningEvent = await ListeningEvent.create(listeningEvent);

        res.status(201).json(createdListeningEvent);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const listeningEventId = req.params.id
        const listeningEvent = await ListeningEvent.findByPk(listeningEventId, {
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
                Recording,
                AudioFile
            ]
        });

        if (!listeningEvent) {
            return res.status(404).json({
                message: 'no listening event found'
            })
        }

        res.status(200).json(listeningEvent);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const listeningEventId = req.params.id;
        const user_id = req.user.id;
        const foundListeningEvent = await ListeningEvent.findOne({
            where: {
                id: listeningEventId,
                user_id: user_id
            }
        });

        if (!foundListeningEvent) {
            return res.status(404).json({
                message: 'no listening event found'
            })
        }

        const { recording_id, audio_file_id, started_at, ended_at, seconds_listened, completed, skipped } = req.body;
        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!audio_file_id) {
            return res.status(400).json({
                message: 'missing audio file id'
            })
        } else if (!started_at) {
            return res.status(400).json({
                message: 'missing started at'
            })
        }

        let listeningEvent = {}

        listeningEvent.user_id = user_id;

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        } else { 
            listeningEvent.recording_id = recording_id;
        }

        if (!/^[1-9]\d*$/.test(audio_file_id)) {
            return res.status(400).json({
                message: 'invalid audio file id'
            })
        } else { 
            listeningEvent.audio_file_id = audio_file_id;
        }

        const parsedStartTime = Date.parse(started_at);
        if (isNaN(parsedStartTime)) {
            return res.status(400).json({
                message: 'invalid started at'
            })
        }
        listeningEvent.started_at = started_at;

        if (ended_at !== undefined) {
            if (ended_at !== null) {
                const parsedEndTime = Date.parse(ended_at);
                if (isNaN(parsedEndTime)) {
                    return res.status(400).json({
                        message: 'invalid ended at'
                    })
                }
                if (parsedEndTime < parsedStartTime) {
                    return res.status(400).json({
                        message: 'invalid ended at time'
                    })
                }
            }
            listeningEvent.ended_at = ended_at;
        }
        if (seconds_listened !== undefined) {
            if (typeof seconds_listened !== "number")  {
                    return res.status(400).json({
                        message: 'seconds listened must be number'
                    })
                } else if (!Number.isInteger(seconds_listened)) {
                    return res.status(400).json({
                        message: 'seconds listened must be number'
                    })
                } else if (seconds_listened < 0) {
                    return res.status(400).json({
                        message: 'seconds listened must be 0 or greater'
                    })
                }
            listeningEvent.seconds_listened = seconds_listened;
        }
        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: 'completed must be boolean'
                })
            }
            listeningEvent.completed = completed;
        }
        if (skipped !== undefined) {
            if (typeof skipped !== "boolean") {
                return res.status(400).json({
                    message: 'skipped must be boolean'
                })
            }
            listeningEvent.skipped = skipped;
        }

        const isAudioFile = await AudioFile.findOne({
            where: {
                id: audio_file_id
            }
        })
        if (!isAudioFile) {
            return res.status(400).json({
                message: 'audio file not found'
            })
        }

        if (isAudioFile.recording_id !== Number(recording_id)) {
            return res.status(400).json({
                message: 'audio file does not belong to recording'
            })
        }

        const updatedListeningEvent = await foundListeningEvent.update(listeningEvent);

        res.status(200).json(updatedListeningEvent);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const listeningEventId = req.params.id;
        const user_id = req.user.id;
        const listeningEvent = await ListeningEvent.findOne({
            where: {
                id: listeningEventId,
                user_id: user_id
            }
        });

        if (!listeningEvent) {
            return res.status(404).json({
                message: 'no listening event found'
            })
        }

        await listeningEvent.destroy();

        res.status(200).json({
            message: 'listening event deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;