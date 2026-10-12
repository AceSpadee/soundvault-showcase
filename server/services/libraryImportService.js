import Artist from "../models/Artist.js";
import Song from "../models/Song.js";
import Recording from "../models/Recording.js";
import AudioFile from "../models/AudioFile.js";
import RecordingArtist from "../models/RecordingArtist.js";
import Album from "../models/Album.js";
import Release from "../models/Release.js";
import ReleaseTrack from "../models/ReleaseTrack.js";
import MetadataMatch from "../models/MetadataMatch.js";
import sequelize from "../config/connection.js";

async function getOrCreateArtist(artistName, transaction) {
    const artist = await Artist.findOne({
        where: {
            name: artistName
        },
        transaction: transaction
    });

    if (artist) {
        return artist
    }

    const newArtist = await Artist.create({name: artistName}, { transaction: transaction })
    return newArtist
};

async function getOrCreateSong(title, primaryArtistId, transaction) {
    const song = await Song.findOne({
        where: {
            title,
            primary_artist_id: primaryArtistId
        },
        transaction: transaction
    });

    if (song) {
        return song
    }

    const newSong = await Song.create({
        title,
        primary_artist_id: primaryArtistId
    }, { transaction: transaction })
    return newSong
};

async function getOrCreateRecording(songId, transaction) {
    const recording = await Recording.findOne({
        where: {
            song_id: songId,
            version: "Original"
        },
        transaction: transaction
    });

    if (recording) {
        return recording
    }
    
    const newRecording = await Recording.create({
        song_id: songId,
        version: "Original"
    }, { transaction: transaction })
    return newRecording
};

async function getOrCreateAudioFile(file, recordingId, transaction) {
    const audioFile = await AudioFile.findOne({
        where: {
            file_path: file.file_path
        },
        transaction: transaction
    });

    if (audioFile) {
        const updatedAudioFile = await audioFile.update({
            recording_id: recordingId,
            file_name: file.file_name,
            format: file.format,
            file_size: file.file_size,
            duration: file.duration,
            is_missing: false
        }, { transaction: transaction })

        return {
            audioFile: updatedAudioFile,
            created: false
        }
    }

    const newAudioFile = await AudioFile.create({
        recording_id: recordingId,
        file_path: file.file_path,
        file_name: file.file_name,
        format: file.format,
        file_size: file.file_size,
        duration: file.duration
    }, { transaction: transaction })

    return {
        audioFile: newAudioFile,
        created: true
    }
};

async function getOrCreateRecordingArtist(recordingId, artistId, transaction) {
    const recordingArtist = await RecordingArtist.findOne({
        where: {
            recording_id: recordingId,
            artist_id: artistId
        },
        transaction: transaction
    });

    if (recordingArtist) {
        return recordingArtist
    }

    const newRecordingArtist = await RecordingArtist.create({
        recording_id: recordingId,
        artist_id: artistId,
        role: "PRIMARY",
        display_order: 1
    }, { transaction: transaction });

    return newRecordingArtist
};

async function getOrCreateAlbum(title, primaryArtistId, transaction) {
    const album = await Album.findOne({
        where: {
            title,
            primary_artist_id: primaryArtistId
        },
        transaction: transaction
    });

    if (album) {
        return album
    }

    const newAlbum = await Album.create({
        title,
        primary_artist_id: primaryArtistId
    }, { transaction: transaction })

    return newAlbum
};

async function getOrCreateRelease(albumId, transaction) {
    const release = await Release.findOne({
        where: {
            album_id: albumId,
            edition: "Original"
        },
        transaction: transaction
    })

    if (release) {
        return release
    }

    const newRelease = await Release.create({
        album_id: albumId,
        edition: "Original"
    }, { transaction: transaction })

    return newRelease
};

async function getOrCreateReleaseTrack(releaseId, recordingId, discNumber, trackNumber, transaction) {
    const releaseTrack = await ReleaseTrack.findOne({
        where: {
            release_id: releaseId,
            recording_id: recordingId
        },
        transaction: transaction
    })

    if (releaseTrack) {
        const updatedReleaseTrack = await releaseTrack.update({
            disc_number: discNumber ?? 1,
            track_number: trackNumber
        }, { transaction: transaction })

        return updatedReleaseTrack
    }

    const newReleaseTrack = await ReleaseTrack.create({
        release_id: releaseId,
        recording_id: recordingId, 
        disc_number: discNumber ?? 1,
        track_number: trackNumber
    }, { transaction: transaction })

    return newReleaseTrack
};

async function getOrCreateMetadataMatch(audioFileId, provider, transaction) {
    const metadataMatch = await MetadataMatch.findOne({
        where: {
            audio_file_id: audioFileId,
            provider
        },
        transaction: transaction
    })

    if (metadataMatch) {
        return metadataMatch
    }

    const newMetadataMatch = await MetadataMatch.create({
        audio_file_id: audioFileId,
        provider,
        external_id: null,
        confidence: null, 
        status: 'UNMATCHED',
    }, { transaction: transaction })

    return newMetadataMatch
}

async function importScannedFile(file) {
    return sequelize.transaction(async (transaction) => {
        const artist = await getOrCreateArtist(file.artist, transaction);

        const song = await getOrCreateSong(file.title, artist.id, transaction);

        const recording = await getOrCreateRecording(song.id, transaction);

        await getOrCreateRecordingArtist(recording.id, artist.id, transaction);
        
        if (file.album !== null) {
            const album = await getOrCreateAlbum(file.album, artist.id, transaction);
            const release = await getOrCreateRelease(album.id, transaction);

            if (file.track_number !== null) {
                await getOrCreateReleaseTrack(release.id, recording.id, file.disc_number, file.track_number, transaction)
            }
        };

        const audioFileResult = await getOrCreateAudioFile(file, recording.id, transaction);

        await getOrCreateMetadataMatch(audioFileResult.audioFile.id, 'MUSICBRAINZ', transaction)

        return audioFileResult
    });
};

export {
    getOrCreateArtist,
    getOrCreateSong,
    getOrCreateRecording,
    getOrCreateAudioFile,
    getOrCreateRecordingArtist,
    getOrCreateAlbum,
    getOrCreateRelease,
    getOrCreateReleaseTrack,
    getOrCreateMetadataMatch,
    importScannedFile,
};