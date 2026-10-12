import {
    MetadataMatch,
    AudioFile,
    Recording,
    Song,
    Artist
} from '../models/index.js';
import searchRecording from "./musicBrainzService.js";
import { access } from 'node:fs/promises';

async function getMetadataMatchWithLocalData(metadataMatchId) {
    const metadataMatch = await MetadataMatch.findByPk(metadataMatchId, {
        include: [
            {
                model: AudioFile,
                include: [
                    {
                        model: Recording,
                        include: [
                            {
                                model: Song,
                                include: [
                                    Artist
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    })

    return metadataMatch
};

async function matchMetadata(metadataMatchId) {
    const localMetadataMatch = await getMetadataMatchWithLocalData(metadataMatchId);
    if (!localMetadataMatch) {
        return null
    };
    
    if (!localMetadataMatch.AudioFile?.Recording?.Song?.Artist) {
        throw new Error('Missing required metadata association');
    }

    try {
        await access(localMetadataMatch.AudioFile.file_path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await localMetadataMatch.AudioFile.update({
                is_missing: true
            })
            return null;
        }

        throw error;
    }

    if (localMetadataMatch.status === "MATCHED") {
        return localMetadataMatch
    }

    const title = localMetadataMatch.AudioFile.Recording.Song.title;
    const artist = localMetadataMatch.AudioFile.Recording.Song.Artist.name;
    const duration = localMetadataMatch.AudioFile.duration;

    if (!title || !artist || artist === "Unknown Artist" || !Number.isFinite(duration) || duration <= 0) {
        return null
    }
    
    const result = await searchRecording(title, artist, duration);
    if (!result) {
        return null
    };
    
    const updatedLocalMetadataMatch = await localMetadataMatch.update({
        external_id: result.recording.id,
        confidence:  result.confidence,
        status: "MATCHED"
    });

    return updatedLocalMetadataMatch
};

async function getUnmatchedMetadataMatches() {
    const metadataMatch = await MetadataMatch.findAll({
        where: {
            status: "UNMATCHED",
            provider: "MUSICBRAINZ",
        },
        include: {
            model: AudioFile,
            where: {
                is_missing: false
            }
        }
    });

    return metadataMatch
};

async function processUnmatchedMetadataMatches() {
    const unmatchedRecords = await getUnmatchedMetadataMatches();
    const results = []

    for (const record of unmatchedRecords) {
        try {
            const resultRecord = await matchMetadata(record.id);
            results.push(resultRecord)
        } catch (error) {
            results.push({
                id: record.id,
                status: "ERROR",
                error: error.message
            })

            console.log({
                id: record.id,
                status: "ERROR",
                error: error.message
            });
        }
    }

    return results
};

export default getMetadataMatchWithLocalData;

export {
    matchMetadata,
    getUnmatchedMetadataMatches,
    processUnmatchedMetadataMatches
}