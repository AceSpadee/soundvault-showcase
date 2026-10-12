import Artist from "./Artist.js";
import Song from "./Song.js";
import Recording from "./Recording.js";
import AudioFile from "./AudioFile.js";
import Album from "./Album.js";
import Release from "./Release.js";
import ReleaseTrack from "./ReleaseTrack.js";
import RecordingArtist from "./RecordingArtist.js";
import User from "./User.js";
import Playlist from "./Playlist.js";
import PlaylistItem from "./PlaylistItem.js";
import Favorite from "./Favorite.js";
import ListeningEvent from "./ListeningEvent.js";
import LibraryRoot from "./LibraryRoot.js";
import ScanRun from "./ScanRun.js";
import MetadataMatch from "./MetadataMatch.js";

Artist.hasMany(Song, {
    foreignKey: 'primary_artist_id'
});
Song.belongsTo(Artist, {
    foreignKey: 'primary_artist_id'
});

Song.hasMany(Recording, {
    foreignKey: 'song_id'
});
Recording.belongsTo(Song, {
    foreignKey: 'song_id'
});

Recording.hasMany(AudioFile, {
    foreignKey: 'recording_id'
});
AudioFile.belongsTo(Recording, {
    foreignKey: 'recording_id'
});

Artist.hasMany(Album, {
    foreignKey: 'primary_artist_id'
});
Album.belongsTo(Artist, {
    foreignKey: 'primary_artist_id'
});

Album.hasMany(Release, {
    foreignKey: 'album_id'
});
Release.belongsTo(Album, {
    foreignKey: 'album_id'
});

Release.belongsToMany(Recording, {
    through: ReleaseTrack,
    foreignKey: 'release_id',
    otherKey: 'recording_id'
});
Recording.belongsToMany(Release, {
    through: ReleaseTrack,
    foreignKey: 'recording_id',
    otherKey: 'release_id'
});

Recording.belongsToMany(Artist, {
    through: RecordingArtist,
    foreignKey: 'recording_id',
    otherKey: 'artist_id'
}); 
Artist.belongsToMany(Recording, {
    through: RecordingArtist,
    foreignKey: 'artist_id',
    otherKey: 'recording_id'
});

Release.hasMany(ReleaseTrack, {
    foreignKey: 'release_id',
}); 
ReleaseTrack.belongsTo(Release, {
    foreignKey: 'release_id',
});

Recording.hasMany(ReleaseTrack, {
    foreignKey: 'recording_id',
}); 
ReleaseTrack.belongsTo(Recording, {
    foreignKey: 'recording_id',
});

Recording.hasMany(RecordingArtist, {
    foreignKey: 'recording_id',
}); 
RecordingArtist.belongsTo(Recording, {
    foreignKey: 'recording_id',
});

Artist.hasMany(RecordingArtist, {
    foreignKey: 'artist_id',
}); 
RecordingArtist.belongsTo(Artist, {
    foreignKey: 'artist_id',
});

User.hasMany(Playlist, {
    foreignKey: 'user_id',
}); 
Playlist.belongsTo(User, {
    foreignKey: 'user_id',
});

Playlist.hasMany(PlaylistItem, {
    foreignKey: 'playlist_id',
}); 
PlaylistItem.belongsTo(Playlist, {
    foreignKey: 'playlist_id',
});

Recording.hasMany(PlaylistItem, {
    foreignKey: 'recording_id',
});
PlaylistItem.belongsTo(Recording, {
    foreignKey: 'recording_id',
});

User.hasMany(Favorite, {
    foreignKey: 'user_id',
});
Favorite.belongsTo(User, {
    foreignKey: 'user_id',
});

Recording.hasMany(Favorite, {
    foreignKey: 'recording_id',
});
Favorite.belongsTo(Recording, {
    foreignKey: 'recording_id',
});

User.hasMany(ListeningEvent, {
    foreignKey: 'user_id',
});
ListeningEvent.belongsTo(User, {
    foreignKey: 'user_id',
});

Recording.hasMany(ListeningEvent, {
    foreignKey: 'recording_id',
});
ListeningEvent.belongsTo(Recording, {
    foreignKey: 'recording_id',
});

AudioFile.hasMany(ListeningEvent, {
    foreignKey: 'audio_file_id',
});
ListeningEvent.belongsTo(AudioFile, {
    foreignKey: 'audio_file_id',
});

LibraryRoot.hasMany(ScanRun, {
    foreignKey: 'library_root_id',
});
ScanRun.belongsTo(LibraryRoot, {
    foreignKey: 'library_root_id',
});

AudioFile.hasMany(MetadataMatch, {
    foreignKey: 'audio_file_id',
});
MetadataMatch.belongsTo(AudioFile, {
    foreignKey: 'audio_file_id',
});

export { 
    Artist, 
    Song, 
    Recording, 
    AudioFile, 
    Album, 
    Release, 
    ReleaseTrack, 
    RecordingArtist, 
    User, 
    Playlist, 
    PlaylistItem, 
    Favorite, 
    ListeningEvent,
    LibraryRoot,
    ScanRun,
    MetadataMatch
};