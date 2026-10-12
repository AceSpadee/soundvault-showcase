import express from 'express';
import Release from '../models/Release.js';
import Album from '../models/Album.js';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { serverError, foreignKeyError, uniqueError } from '../helpers/errorHelpers.js';

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

router.post('/', async (req, res) => {
    try {
        const { album_id, edition, release_year, musicbrainz_id } = req.body;
        if (!album_id) {
            return res.status(400).json({
                message: 'missing album id'
            })
        }

        let release = {
            album_id
        }
        
        if (release_year !== undefined) {
            if (!/^[1-9]\d*$/.test(release_year)) {
                return res.status(400).json({
                    message: 'invalid release year'
                })
            } else { 
                release.release_year = release_year;
            }
        }

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                release.musicbrainz_id = null
            } else { 
                release.musicbrainz_id = musicbrainz_id.trim();
            }
        }

        if (edition !== undefined) {
            if (edition.trim() === '') {
                return res.status(400).json({
                    message: 'provided edition cannot be blank'
                })
            }

            release.edition = edition.trim();
        }

        const createdRelease = await Release.create(release);

        res.status(201).json(createdRelease);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        } else if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

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

router.put('/:id', async (req, res) => {
    try {
        const releaseId = req.params.id;

        const foundRelease = await Release.findByPk(releaseId);
        if (!foundRelease) {
            return res.status(404).json({
                message: 'release not found'
            })
        }

        const { album_id, edition, release_year, musicbrainz_id } = req.body;
        if (!album_id) {
            return res.status(400).json({
                message: 'missing album id'
            })
        }

        let release = {
            album_id
        }

        if (release_year !== undefined) {
            if (!/^[1-9]\d*$/.test(release_year)) {
                return res.status(400).json({
                    message: 'invalid release year'
                })
            } else { 
                release.release_year = release_year;
            }
        }

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                release.musicbrainz_id = null
            } else { 
                release.musicbrainz_id = musicbrainz_id.trim();
            }
        }

        if (edition !== undefined) {
            if (edition.trim() === '') {
                return res.status(400).json({
                    message: 'provided edition cannot be blank'
                })
            }
            release.edition = edition.trim();
        }

        const updatedRelease = await foundRelease.update(
            release
        )

        res.status(200).json(updatedRelease);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        } else if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const releaseId = req.params.id;

        const release = await Release.findByPk(releaseId);
        if (!release) {
            return res.status(404).json({
                message: 'release not found'
            })
        }

        await release.destroy();

        res.status(200).json({
            message: 'release deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;