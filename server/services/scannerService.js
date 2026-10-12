import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import readAudioMetadata from './metadataService.js';

const allowedTypes = ['.mp3', '.flac', '.m4a'];

async function scanDirectory(path) {
    const entriesData = await readdir(path, { withFileTypes: true });

    const results = [];

    for (const entry of entriesData) {
        const fileExtension = extname(entry.name).toLowerCase();

        if (entry.isFile() && allowedTypes.includes(fileExtension)) {

            const normalizedFormat = fileExtension.replace('.', '');

            const fullPath = join(path, entry.name);
            const stats = await stat(fullPath);

            const metadata = await readAudioMetadata(fullPath);

            const result = {
                ...metadata,
                file_path: fullPath,
                file_name: entry.name,
                format: normalizedFormat.toUpperCase(),
                file_size: stats.size
            };

            results.push(result);
        }

        if (entry.isDirectory()) {
            const nestedPath = join(path, entry.name);
            const nestedFiles = await scanDirectory(nestedPath);

            results.push(...nestedFiles);
        }
    }

    return results;
};

export default scanDirectory;