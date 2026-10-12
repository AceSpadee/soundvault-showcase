import express from 'express';
import ScanRun from '../models/ScanRun.js';
import LibraryRoot from '../models/LibraryRoot.js';
import { ForeignKeyConstraintError } from 'sequelize';
import { serverError, foreignKeyError } from '../helpers/errorHelpers.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
    try {
        const scanRun = await ScanRun.findAll({
            include: LibraryRoot
        });

        res.status(200).json(scanRun);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { library_root_id, status, started_at, finished_at, files_found, files_added } = req.body;
        if (!library_root_id) {
            return res.status(400).json({
                message: 'missing library root id'
            })
        }

        let scanRun = {
            library_root_id,
        }

        if (status !== undefined) {
            if (typeof status !== 'string') {
                return res.status(400).json({
                    message: 'status provided must be string'
                })
            } else if (status.trim() === '') {
                return res.status(400).json({
                    message: 'status provided cannot be empty'
                })
            }
            scanRun.status = status.trim();
        }
        if (started_at !== undefined) {
            const parsedTimestamp = Date.parse(started_at);
            if (isNaN(parsedTimestamp)) {
                return res.status(400).json({
                    message: 'invalid started at'
                })
            }
            scanRun.started_at = started_at;
        }
        if (finished_at !== undefined) {
            const parsedTimestamp = Date.parse(finished_at);
            if (isNaN(parsedTimestamp)) {
                return res.status(400).json({
                    message: 'invalid finished at'
                })
            }
            scanRun.finished_at = finished_at;
        }
        if (files_found !== undefined) {
            if (!/^\d+$/.test(files_found)) {
                return res.status(400).json({
                    message: 'invalid files found'
                })
            } else { 
                scanRun.files_found = files_found;
            }
        }
        if (files_added !== undefined) {
            if (!/^\d+$/.test(files_added)) {
                return res.status(400).json({
                    message: 'invalid files added'
                })
            } else { 
                scanRun.files_added = files_added;
            }
        }

        const createdScanRun = await ScanRun.create(scanRun);

        res.status(201).json(createdScanRun);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const scanRunId = req.params.id;
        const scanRun = await ScanRun.findByPk(scanRunId, {
            include: LibraryRoot
        });
        if (!scanRun) {
            return res.status(404).json({
                message: 'no scan found'
            })
        }

        res.status(200).json(scanRun);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const scanRunId = req.params.id;
        const foundScanRun = await ScanRun.findByPk(scanRunId);
        if (!foundScanRun) {
            return res.status(404).json({
                message: 'no scan found'
            })
        }

        const { library_root_id, status, started_at, finished_at, files_found, files_added } = req.body;
        if (!library_root_id) {
            return res.status(400).json({
                message: 'missing library root id'
            })
        }

        let scanRun = {
            library_root_id,
        }

        if (status !== undefined) {
            if (typeof status !== 'string') {
                return res.status(400).json({
                    message: 'status provided must be string'
                })
            } else if (status.trim() === '') {
                return res.status(400).json({
                    message: 'status provided cannot be empty'
                })
            }
            scanRun.status = status.trim();
        }
         if (started_at !== undefined) {
            const parsedTimestamp = Date.parse(started_at);
            if (isNaN(parsedTimestamp)) {
                return res.status(400).json({
                    message: 'invalid started at'
                })
            }
            scanRun.started_at = started_at;
        }
        if (finished_at !== undefined) {
            const parsedTimestamp = Date.parse(finished_at);
            if (isNaN(parsedTimestamp)) {
                return res.status(400).json({
                    message: 'invalid finished at'
                })
            }
            scanRun.finished_at = finished_at;
        }
        if (files_found !== undefined) {
            if (!/^\d+$/.test(files_found)) {
                return res.status(400).json({
                    message: 'invalid files found'
                })
            } else { 
                scanRun.files_found = files_found;
            }
        }
        if (files_added !== undefined) {
            if (!/^\d+$/.test(files_added)) {
                return res.status(400).json({
                    message: 'invalid files added'
                })
            } else { 
                scanRun.files_added = files_added;
            }
        }

        const createdScanRun = await foundScanRun.update(scanRun);

        res.status(200).json(createdScanRun);
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const scanRunId = req.params.id;
        const scanRun = await ScanRun.findByPk(scanRunId);
        if (!scanRun) {
            return res.status(404).json({
                message: 'no scan found'
            })
        }

        await scanRun.destroy();

        res.status(200).json({
            message: 'scan run deleted'
        });
    } catch (error) {
        serverError(res, error);
    }
});

export default router;