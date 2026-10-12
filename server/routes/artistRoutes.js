import express from 'express';
import Artist from '../models/Artist.js';
import Song from '../models/Song.js';
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { serverError, uniqueError, foreignKeyError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const artists = await Artist.findAll();

        res.status(200).json(artists);
    } catch (error) {
        serverError(res, error);
    };
});

router.post('/', async (req, res) => {
    try {
        const { name, musicbrainz_id } = req.body
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: 'name required'
            })
        }

        const artist = {
            name: name.trim()
        }

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                artist.musicbrainz_id = null
            } else { 
                artist.musicbrainz_id = musicbrainz_id.trim();
            }
        }

        const createdArtist = await Artist.create(artist);

        res.status(201).json(createdArtist);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    };
})

router.get('/:id', async (req, res) => {
    try {
        const artistId = req.params.id

        const artist = await Artist.findByPk(artistId, {
            include: [Song]
        });
        if (!artist) {
            return res.status(404).json({
                message: 'no artist found'
            })
        };

        res.status(200).json(artist);
    } catch (error) {
        serverError(res, error);
    };
});

router.put('/:id', async (req, res) => {
    try {
        const artistId = req.params.id
        const { name, musicbrainz_id } = req.body

        const foundArtist = await Artist.findByPk(artistId);
        if (!foundArtist) {
            return res.status(404).json({
                message: 'no artist found'
            })
        };

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: 'name required'
            })
        }

        const artist = {
            name: name.trim()
        }

        if (musicbrainz_id !== undefined) {
            if (musicbrainz_id.trim() === '') {
                artist.musicbrainz_id = null
            } else { 
                artist.musicbrainz_id = musicbrainz_id.trim();
            }
        }

        const updatedArtist = await foundArtist.update(artist);

        res.status(200).json(updatedArtist);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    };
});

router.delete('/:id', async (req, res) => {
    try {
        const artistId = req.params.id

        const artist = await Artist.findByPk(artistId);
        if (!artist) {
            return res.status(404).json({
                message: 'no artist found'
            })
        };

        await artist.destroy();

        res.status(200).json({
            message: 'artist deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    };
});

export default router;