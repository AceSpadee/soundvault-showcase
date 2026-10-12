import express from 'express';
import Album from '../models/Album.js';
import Artist from '../models/Artist.js';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { serverError, foreignKeyError, uniqueError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const album = await Album.findAll({
            include: [Artist]
        });

        res.status(200).json(album);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, primary_artist_id, musicbrainz_id } = req.body

        if (!title || title.trim() === '') {
            return res.status(400).json({
                message: 'missing title'
            })
        } else if (!primary_artist_id) {
            return res.status(400).json({
                message: 'missing artist id'
            })
        };

        const album = {
            title: title.trim(),
            primary_artist_id
        };

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                album.musicbrainz_id = null
            } else { 
                album.musicbrainz_id = musicbrainz_id.trim();
            }
        }

        const createdAlbum = await Album.create(album);

        res.status(201).json(createdAlbum);
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
        const albumId = req.params.id

        const album = await Album.findByPk(albumId, {
            include: [Artist]
        });
        if (!album) {
            return res.status(404).json({
                message: 'missing album'
            })
        }

        res.status(200).json(album);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const albumId = req.params.id
        const album = await Album.findByPk(albumId);
        if (!album) {
            return res.status(404).json({
                message: 'missing album'
            })
        };
        
        const { title, primary_artist_id, musicbrainz_id } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                message: 'missing title'
            })
        } else if (!primary_artist_id) {
            return res.status(400).json({
                message: 'missing artist id'
            })
        };

        const newTitle = title.trim();

        const newAlbum = { 
            title: newTitle, 
            primary_artist_id
        };

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                newAlbum.musicbrainz_id = null
            } else { 
                newAlbum.musicbrainz_id = musicbrainz_id.trim();
            }
        }


        const updatedAlbum = await album.update(
            newAlbum
        )

        res.status(200).json(updatedAlbum);
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
        const albumId = req.params.id

        const album = await Album.findByPk(albumId);
        if (!album) {
            return res.status(404).json({
                message: 'missing album'
            })
        }

        await album.destroy();

        res.status(200).json({
            message: 'album deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

export default router;