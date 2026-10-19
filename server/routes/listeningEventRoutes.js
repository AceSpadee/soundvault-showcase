import { env } from 'cloudflare:workers';
import express from 'express';
import { serverError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const listeningEvent = await env.soundvaultpublic_db
            .prepare(`SELECT * FROM listening_events WHERE demo_session_id = ?`)
            .bind(req.demoSessionId)
            .all()

        res.status(200).json(listeningEvent.results);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { recording_id, started_at, ended_at, seconds_listened, completed, skipped } = req.body;
        const user_id = req.demoSessionId;

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!started_at) {
            return res.status(400).json({
                message: 'missing started at'
            })
        }

        if (!/^[1-9]\d*$/.test(recording_id)) {
            return res.status(400).json({
                message: 'invalid recording id'
            })
        }

        const parsedStartTime = Date.parse(started_at);
        if (isNaN(parsedStartTime)) {
            return res.status(400).json({
                message: 'invalid started at'
            })
        }

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
        }
        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: 'completed must be boolean'
                })
            }
        }
        if (skipped !== undefined) {
            if (typeof skipped !== "boolean") {
                return res.status(400).json({
                    message: 'skipped must be boolean'
                })
            }
        }

        const createdListeningEvent = await env.soundvaultpublic_db
            .prepare(`INSERT INTO listening_events (
                demo_session_id, 
                recording_id, 
                started_at, 
                ended_at, 
                seconds_listened,
                completed,
                skipped
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING *`)
            .bind(user_id, 
                recording_id, 
                started_at, 
                ended_at ?? null, 
                seconds_listened ?? null, 
                completed == null ? null : Number(completed), 
                skipped == null ? null : Number(skipped))
            .first()

        res.status(201).json(createdListeningEvent);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;