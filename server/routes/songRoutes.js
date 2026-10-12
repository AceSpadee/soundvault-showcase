import express from 'express';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const song = await Song.findAll({
            include: [Artist]
        });

        res.status(200).json(song);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, primary_artist_id } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                message: 'missing title'
            })
        }
        if (!primary_artist_id) {
            return res.status(400).json({
                message: 'missing primary artist'
            })
        }

        const newTitle = title.trim();

        const song = await Song.create(
            { title: newTitle, primary_artist_id}
        )

        res.status(201).json(song);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const songId = req.params.id

        const song = await Song.findByPk(songId, {
            include: [Artist]
        });
        if (!song) {
            return res.status(404).json({
                message: 'no song found'
            })
        }

        res.status(200).json(song);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const songId = req.params.id;
        const { title, primary_artist_id } = req.body;

        const song = await Song.findByPk(songId);
        if (!song) {
            return res.status(404).json({
                message: 'no song found'
            })
        }

        if (!title || title.trim() === '') {
            return res.status(400).json({
                message: 'missing title'
            })
        }
        if (!primary_artist_id) {
            return res.status(400).json({
                message: 'missing primary artist'
            })
        }

        const newTitle = title.trim();

        const newSong = await song.update({
            title: newTitle, primary_artist_id
        })

        res.status(200).json(newSong);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const songId = req.params.id

        const song = await Song.findByPk(songId);
        if (!song) {
            return res.status(404).json({
                message: 'no song found'
            })
        }

        await song.destroy();

        res.status(200).json({
            message: 'song deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }
        
        serverError(res, error);
    }
})

export default router;