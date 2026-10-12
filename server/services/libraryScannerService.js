import LibraryRoot from "../models/LibraryRoot.js";
import ScanRun from "../models/ScanRun.js";
import scanDirectory from "./scannerService.js";
import { importScannedFile } from "./libraryImportService.js";
import AudioFile from "../models/AudioFile.js";
import { relative, sep, isAbsolute } from 'node:path';

async function scanLibraryRoot(libraryRootId) {
    const libraryRoot = await LibraryRoot.findByPk(libraryRootId);
    if (!libraryRoot || libraryRoot.enabled === false) {
        return null
    }
    const runningScan = await ScanRun.findOne({
        where: {
            library_root_id: libraryRootId,
            status: 'RUNNING'
        }
    });
    if (runningScan) {
        const ageInMs = new Date() - runningScan.started_at;
        const maxScanRunTimeMS = 60 * 60 * 1000;

        const isStale = ageInMs >= maxScanRunTimeMS

        if (isStale) {
            await runningScan.update({
                status: 'FAILED',
                finished_at: new Date(),
                error_message: "Scan exceeded maximum runtime"
            })
        } else {
            return {
                message: 'already running',
                scan_run_id: runningScan.id
            }
        }
    }

    const scanRun = await ScanRun.create({
        library_root_id: libraryRoot.id,
        status: 'RUNNING',
        started_at: new Date()
    })

    let filesAdded = 0;
    let filesFound = 0;
    try {
        const results = await scanDirectory(libraryRoot.path);
        filesFound = results.length;

        for (const file of results) {
            const importResult = await importScannedFile(file);
            if (importResult.created) {
                filesAdded++
            }
        }

        const audioFiles = await AudioFile.findAll();
        
        const scannedPaths = new Set(results.map(file => file.file_path));

        const rootAudioFiles = audioFiles.filter(audioFile => {
            const relativePath = relative(libraryRoot.path, audioFile.file_path);

            return (
                relativePath !== '..' &&
                !relativePath.startsWith(`..${sep}`) &&
                !isAbsolute(relativePath)
            );
        });

        const missingFiles = rootAudioFiles.filter(audioFile => {
            return !scannedPaths.has(audioFile.file_path)
        });

        for (const audioFile of missingFiles) {
            await audioFile.update({
                is_missing: true
            })
        }
        
        await scanRun.update({
            status: 'COMPLETED',
            finished_at: new Date(),
            files_found: filesFound,
            files_added: filesAdded
        })

        return {
            scan_run_id: scanRun.id,
            files: results,
            files_found: filesFound,
            files_added: filesAdded
        }
    } catch (error) {
        await scanRun.update({
            status: 'FAILED',
            files_found: filesFound,
            files_added: filesAdded,
            finished_at: new Date(),
            error_message: error.message
        })

        console.error(error);
        error.scan_run_id = scanRun.id;
        throw error;
    }
};

export default scanLibraryRoot;