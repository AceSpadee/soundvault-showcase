import { parseFile } from 'music-metadata';
import { basename, extname } from 'node:path';

async function readAudioMetadata(filePath) {
    const fallbackTitle = basename(filePath, extname(filePath));

    try {
        const metadata = await parseFile(filePath);

        const result = {
            title: metadata.common.title ?? fallbackTitle,
            artist: metadata.common.artist ?? 'Unknown Artist',
            album: metadata.common.album ?? null,
            track_number: metadata.common.track?.no ?? null,
            disc_number: metadata.common.disk?.no ?? null,
            duration: metadata.format.duration ?? null
        };

        return result
    } catch (error) {
        console.error(error)

        return {
            title: fallbackTitle,
            artist: 'Unknown Artist',
            album: null,
            track_number: null,
            disc_number: null,
            duration: null
        }
    }
};

export default readAudioMetadata;