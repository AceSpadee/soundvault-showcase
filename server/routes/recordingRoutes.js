import express from 'express';
import Recording from '../models/Recording.js';
import Song from '../models/Song.js';
import AudioFile from '../models/AudioFile.js';
import { serverError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';
import { stat, realpath } from 'node:fs/promises';
import LibraryRoot from '../models/LibraryRoot.js';
import { relative, sep, isAbsolute } from 'node:path';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const recording = await Recording.findAll({
            include: [Song]
        });

        res.status(200).json(recording);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recordId = req.params.id;
        const recording = await Recording.findByPk(recordId, {
            include: [Song]
        });

        if (!recording) {
            return res.status(404).json({
                message: 'no recording found'
            })
        }

        res.status(200).json(recording);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:recordingId/stream', requireAuth, async (req, res) => {
    try {
        const recordingId = req.params.recordingId;
        if (!/^[1-9]\d*$/.test(recordingId)) {
            return res.status(400).json({
                message: 'invalid recording id'
            });
        }

        // Get all library folders that are currently enabled. An audio file must be inside one of these folders before we serve it.
        const libraryRoots = await LibraryRoot.findAll({
            where: {
                enabled: true
            }
        });

        // Get every available AudioFile database row for this recording. A recording can have more than one physical audio file.
        const audioFiles = await AudioFile.findAll({
            where: {
                recording_id: recordingId,
                is_missing: false
            }
        });
        if (audioFiles.length === 0) {
            return res.status(404).json({
                message: 'no audio file found'
            });
        }

        // These stay null until we find a real and allowed audio file.
        let audioFile = null;
        let resolvedAudioPath = null;

        // Try each AudioFile connected to this recording.
        for (let i = 0; i < audioFiles.length; i++) {
            try {
                // Resolve the real filesystem path. This also confirms the file actually exists.
                const candidatePath = await realpath(
                    audioFiles[i].file_path
                );

                // Each new audio file starts as not allowed. It must prove that it belongs to an enabled library root.
                let isAllowed = false;

                // Check the candidate file against every enabled library root.
                for (const libraryRoot of libraryRoots) {
                    try {
                        // Resolve the real path of the library root.
                        const resolvedRootPath = await realpath(
                            libraryRoot.path
                        );

                        // Find the candidate file's path relative to this root.
                        //
                        // Example:
                        // Root:
                        // C:\Music
                        //
                        // Candidate:
                        // C:\Music\Aespa\Whiplash.mp3
                        //
                        // Relative path:
                        // Aespa\Whiplash.mp3
                        const relativePath = relative(
                            resolvedRootPath,
                            candidatePath
                        );

                        // The file is allowed if its relative path does not escape outside the library root.
                        if (
                            relativePath !== '..' &&
                            !relativePath.startsWith(`..${sep}`) &&
                            !isAbsolute(relativePath)
                        ) {
                            isAllowed = true;
                            break;
                        }
                    } catch (error) {
                        // If this library root no longer exists, skip it and check the next root.
                        if (error.code === 'ENOENT') {
                            continue;
                        }

                        // Unexpected filesystem errors should be handled by the route's outer catch.
                        throw error;
                    }
                }

                // This audio file exists, but it is not inside any enabled library root, so try the next AudioFile.
                if (!isAllowed) {
                    continue;
                }

                // Final check that the resolved path points to an actual file and not something such as a directory.
                const stats = await stat(candidatePath);

                if (!stats.isFile()) {
                    continue;
                }

                // We found a file that:
                // 1. exists on disk
                // 2. belongs to an enabled library root
                // 3. is actually a file
                //
                // Save it and stop searching.
                audioFile = audioFiles[i];
                resolvedAudioPath = candidatePath;
                break;

            } catch (error) {
                // If this particular audio file is missing from disk, skip it and try the next AudioFile.
                if (error.code === 'ENOENT') {
                    continue;
                }

                throw error;
            }
        }

        // We checked every AudioFile and none were usable.
        if (!audioFile) {
            return res.status(404).json({
                message: 'audio file missing'
            });
        }

        // Send the audio file to the browser.
        return res.sendFile(resolvedAudioPath);

    } catch (error) {
        console.error('Filesystem error:', error.code);

        // Handle files that disappeared while the request was being processed.
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                message: 'audio file missing'
            });
        }

        // Handle unexpected server/database/filesystem errors.
        serverError(res, error);
    }
});

export default router;