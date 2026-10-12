import express from 'express';
import AudioFile from '../models/AudioFile.js';
import Recording from '../models/Recording.js';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { serverError, foreignKeyError, uniqueError } from '../helpers/errorHelpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const audioFile = await AudioFile.findAll({
            include: [Recording]
        });

        res.status(200).json(audioFile);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { recording_id, file_path, file_name, format, file_size } = req.body;

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!file_path || file_path.trim() === '') {
            return res.status(400).json({
                message: 'missing file path'
            })
        } else if (!file_name || file_name.trim() === '') {
            return res.status(400).json({
                message: 'missing file name'
            })
        } else if (!format || format.trim() === '') {
            return res.status(400).json({
                message: 'missing format'
            })
        } else if (!file_size) {
            return res.status(400).json({
                message: 'missing file size'
            })
        }
         else if (!/^[1-9]\d*$/.test(file_size)) {
            return res.status(400).json({
                message: 'invalid file size'
            })
        }

        const newFilePath = file_path.trim();
        const newFileName = file_name.trim();
        const newFormat = format.trim().toUpperCase();

        const allowedFormats = ['MP3', 'FLAC', 'M4A']

        if (!allowedFormats.includes(newFormat)) {
            return res.status(400).json({
                message: 'invalid format'
            })
        } 

        const audioFile = await AudioFile.create(
            { recording_id, file_path: newFilePath, file_name: newFileName, format: newFormat, file_size }
        );

        res.status(201).json(audioFile);
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
        const audioId = req.params.id;
        const audioFile = await AudioFile.findByPk(audioId, {
            include: [Recording]
        });

        if (!audioFile) {
            return res.status(404).json({
                message: 'no audio file found'
            })
        }

        res.status(200).json(audioFile);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const audioId = req.params.id;
        const audioFile = await AudioFile.findByPk(audioId);
        if (!audioFile) {
            return res.status(404).json({
                message: 'no audio file found'
            })
        };

        const { recording_id, file_path, file_name, format, file_size } = req.body

        if (!recording_id) {
            return res.status(400).json({
                message: 'missing recording id'
            })
        } else if (!file_path || file_path.trim() === '') {
            return res.status(400).json({
                message: 'missing file path'
            })
        } else if (!file_name || file_name.trim() === '') {
            return res.status(400).json({
                message: 'missing file name'
            })
        } else if (!format || format.trim() === '') {
            return res.status(400).json({
                message: 'missing format'
            })
        } else if (!file_size) {
            return res.status(400).json({
                message: 'missing file size'
            })
        } else if (!/^[1-9]\d*$/.test(file_size)) {
            return res.status(400).json({
                message: 'invalid file size'
            })
        }

        const newFilePath = file_path.trim();
        const newFileName = file_name.trim();
        const newFormat = format.trim().toUpperCase();

        const allowedFormats = ['MP3', 'FLAC', 'M4A']

        if (!allowedFormats.includes(newFormat)) {
            return res.status(400).json({
                message: 'invalid format'
            })
        } 

        const newAudioFile = { 
            recording_id, 
            file_path: newFilePath, 
            file_name: newFileName, 
            format: newFormat, 
            file_size 
        };

        const updatedAudioFile = await audioFile.update(
            newAudioFile
        )

        res.status(200).json(updatedAudioFile);
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
        const audioId = req.params.id;
        const audioFile = await AudioFile.findByPk(audioId);
        if (!audioFile) {
            return res.status(404).json({
                message: 'no audio file found'
            })
        }

        await audioFile.destroy();

        res.status(200).json({
            message: 'audio file deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

export default router;