import express from 'express';
import LibraryRoot from '../models/LibraryRoot.js';
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { serverError, uniqueError, foreignKeyError } from '../helpers/errorHelpers.js';
import scanLibraryRoot from '../services/libraryScannerService.js';
import ScanRun from '../models/ScanRun.js';
import { processUnmatchedMetadataMatches } from '../services/metadataMatchingService.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
    try {
        const libraryRoot = await LibraryRoot.findAll();

        res.status(200).json(libraryRoot);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, path, enabled } = req.body;

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (!name || name.trim() === '') {
            return res.status(400).json({
                message: 'missing name'
            })
        }
        if (typeof path !== 'string') {
            return res.status(400).json({
                message: 'path must be string'
            })
        } else if (!path || path.trim() === '') {
            return res.status(400).json({
                message: 'missing path'
            })
        }

        let libraryRoot = {
            name: name.trim(),
            path: path.trim()
        }

        if (enabled !== undefined) {
            if (enabled !== true && enabled !== false) {
                return res.status(400).json({
                    message: 'provided enabled invalid'
                })
            }
            libraryRoot.enabled = enabled;
        }

        const createdLibraryRoot = await LibraryRoot.create(libraryRoot);

        res.status(201).json(createdLibraryRoot);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        const libraryRoot = await LibraryRoot.findByPk(libraryRootId);
        if (!libraryRoot) {
            return res.status(404).json({
                message: 'no library root found'
            })
        }

        res.status(200).json(libraryRoot);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        const foundLibraryRoot = await LibraryRoot.findByPk(libraryRootId);
        if (!foundLibraryRoot) {
            return res.status(404).json({
                message: 'no library root found'
            })
        }

        const { name, path, enabled } = req.body;
        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'name must be string'
            })
        } else if (!name || name.trim() === '') {
            return res.status(400).json({
                message: 'missing name'
            })
        }
        if (typeof path !== 'string') {
            return res.status(400).json({
                message: 'path must be string'
            })
        } else if (!path || path.trim() === '') {
            return res.status(400).json({
                message: 'missing path'
            })
        }

        let libraryRoot = {
            name: name.trim(),
            path: path.trim()
        }

        if (enabled !== undefined) {
            if (enabled !== true && enabled !== false) {
                return res.status(400).json({
                    message: 'provided enabled invalid'
                })
            }
            libraryRoot.enabled = enabled;
        }

        const updatedLibraryRoot = await foundLibraryRoot.update(libraryRoot);

        res.status(200).json(updatedLibraryRoot);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        const libraryRoot = await LibraryRoot.findByPk(libraryRootId);
        if (!libraryRoot) {
            return res.status(404).json({
                message: 'no library root found'
            })
        }

        await libraryRoot.destroy();

        res.status(200).json({
            message: 'library root deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }

        serverError(res, error);
    }
});

router.post('/:id/scan', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        if (!/^[1-9]\d*$/.test(libraryRootId)) {
            return res.status(400).json({
                message: 'invalid Id'
            })
        }

        const scan = await scanLibraryRoot(libraryRootId)

        if (!scan) {
            return res.status(404).json({
                message: 'invalid scan'
            })
        } else if (scan.message === 'already running') {
            return res.status(409).json({
                message: "scan already running",
                scan_run_id: scan.scan_run_id
            })
        }

        let matchingResults = [];
        let matchingFailed = false;
        try {
            matchingResults = await processUnmatchedMetadataMatches();
        } catch (error) {
            matchingFailed = true;
            console.error(error)
        }

        let matchingSummary = {};
        const attempted = matchingResults.length;
        const matched = matchingResults.filter(result => result?.status === "MATCHED").length;
        const unmatched = matchingResults.filter(result => result === null).length;
        const errors = matchingResults.filter(result => result?.status === "ERROR").length;

        matchingSummary.attempted = attempted
        matchingSummary.matched = matched
        matchingSummary.unmatched = unmatched
        matchingSummary.errors = errors
        matchingSummary.processor_failed = matchingFailed

        res.status(200).json({
            message: 'scan completed',
            scan_run_id: scan.scan_run_id,
            files_found: scan.files_found,
            files_added: scan.files_added,
            files: scan.files,
            matching_summary: matchingSummary
        });
    } catch (error) {
        if (Object.hasOwn(error, 'scan_run_id')) {
            return res.status(500).json({
                message: error.message,
                scan_run_id: error.scan_run_id
            })
        }
        serverError(res, error);
    }
});

router.get('/:id/scans', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        let limit = req.query.limit;
        let offset = req.query.offset;
        let status = req.query.status;
        if (!/^[1-9]\d*$/.test(libraryRootId)) {
            return res.status(400).json({
                message: 'invalid Id'
            })
        }
        if (!limit) {
            limit = 10
        }
        if (!offset) {
            offset = 0
        }
        let normalizedStatus
        if (status) {
            normalizedStatus = status.toUpperCase();
            let allowedStatus = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'];
            if (!allowedStatus.includes(normalizedStatus)) {
                return res.status(400).json({
                    message: 'invalid status'
                })
            }
        }

        const libraryRoot = await LibraryRoot.findByPk(libraryRootId);
        if (!libraryRoot) {
            return res.status(404).json({
                message: 'invalid library root Id'
            })
        }

        if (!/^[1-9]\d*$/.test(limit)) {
            return res.status(400).json({
                message: 'invalid limit'
            })
        }
        if (Number(limit) > 100) {
            return res.status(400).json({
                message: "limit cannot exceed 100"
            })
        }
        if (!/^\d+$/.test(offset)) {
            return res.status(400).json({
                message: 'invalid offset'
            })
        }

        const whereConditions = {
            library_root_id: libraryRootId
        };

        if (status) {
            whereConditions.status = normalizedStatus;
        }

        const scan = await ScanRun.findAndCountAll({
            where: whereConditions,
            limit: Number(limit),
            offset: Number(offset),
            order: [
                ['id', 'DESC']
            ]
        })
        const has_more = Number(offset) + scan.rows.length < scan.count;
        const page = Math.floor(Number(offset) / Number(limit)) + 1;
        const total_pages = Math.ceil(scan.count / Number(limit));
        const has_previous = Number(offset) > 0;

        res.status(200).json({
            total: scan.count,
            limit: Number(limit),
            offset: Number(offset),
            total_pages: total_pages,
            page: page,
            has_previous: has_previous,
            status: normalizedStatus ?? null,
            scans: scan.rows,
            has_more: has_more
        });
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id/scans/latest', async (req, res) => {
    try {
        const libraryRootId = req.params.id;
        if (!/^[1-9]\d*$/.test(libraryRootId)) {
            return res.status(400).json({
                message: 'invalid Id'
            })
        }
        const libraryRoot = await LibraryRoot.findByPk(libraryRootId);
        if (!libraryRoot) {
            return res.status(404).json({
                message: 'library root not found'
            })
        }

        const scan = await ScanRun.findOne({
            where: {
                library_root_id: libraryRootId
            },
            order: [
                ['id', 'DESC']
            ]
        })
        if (!scan) {
            return res.status(404).json({
                message: 'scan not found'
            })
        }

        res.status(200).json(scan);
    } catch (error) {
        serverError(res, error);
    }
});

router.get('/:id/scans/:scanRunId', async (req, res) => {
    try {
        const { id, scanRunId } = req.params;
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: 'invalid Id'
            })
        }
        if (!/^[1-9]\d*$/.test(scanRunId)) {
            return res.status(400).json({
                message: 'invalid scan run Id'
            })
        }

        const libraryRoot = await LibraryRoot.findByPk(id);
        if (!libraryRoot) {
            return res.status(404).json({
                message: 'invalid library root Id'
            })
        }

        const scan = await ScanRun.findOne({
            where: {
                id: scanRunId,
                library_root_id: id
            }
        })
        if (!scan) {
            return res.status(404).json({
                message: 'scan run Id not found'
            })
        }

        res.status(200).json(scan);
    } catch (error) {
        serverError(res, error);
    }
});

export default router;