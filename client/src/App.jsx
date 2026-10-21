import { useState, useEffect } from 'react';
import PlayerBar from './components/PlayerBar.jsx';
import MusicCredits from './components/MusicCredits.jsx';
import DemoInfo from './components/DemoInfo.jsx';
import './App.css';

export default function App() {
    const [recordings, setRecordings] = useState([]);
    const [isRecordingsLoading, setIsRecordingsLoading] = useState(false);
    const [recordingsError, setRecordingsError] = useState('');
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [editPlaylistName, setEditPlaylistName] = useState('');
    const [editPlaylistId, setEditPlaylistId] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistItems, setPlaylistItems] = useState([]);
    const [autoPlay, setAutoPlay] = useState(false);
    const [playbackQueue, setPlaybackQueue] = useState([]);
    const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(false);
    const [playlistsError, setPlaylistsError] = useState('');
    const [isPlaylistItemsLoading, setIsPlaylistItemsLoading] = useState(false);
    const [playlistItemsError, setPlaylistItemsError] = useState('');
    const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                setIsRecordingsLoading(true);
                setRecordingsError('');
                const response = await fetch('/api/v1/recordings', {
                    credentials: 'include', 
                });
                
                if (!response.ok) {
                    setRecordings([]);
                    setRecordingsError('Unable to load your library. Please try again.')
                    return;
                }

                const recordingsData = await response.json();

                setRecordings(recordingsData);
            } catch (error) {
                setRecordings([]);
                setRecordingsError(error.message)
            } finally {
                setIsRecordingsLoading(false);
            }
        };

        fetchRecordings();
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setIsFavoritesLoading(true);
                setFavoritesError('');
                const response = await fetch('/api/v1/favorites', {
                    credentials: 'include', 
                });
                
                if (!response.ok) {
                    setFavoritesError('Unable to load your favorites. Please try again.')
                    return;
                }

                const favoritesData = await response.json();

                setFavorites(favoritesData);
            } catch (error) {
                setFavoritesError(error.message);
            } finally {
                setIsFavoritesLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setIsPlaylistsLoading(true);
                setPlaylistsError('');
                const response = await fetch('/api/v1/playlists', {
                    credentials: 'include', 
                });
                
                if (!response.ok) {
                    setPlaylistsError('Unable to load your playlists. Please try again.')
                    return;
                }

                const playlistsData = await response.json();

                setPlaylists(playlistsData);
            } catch (error) {
                setPlaylistsError(error.message)
            } finally {
                setIsPlaylistsLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    useEffect(() => {
        if (!selectedPlaylist) {
            setPlaylistItems([]);
            setIsPlaylistItemsLoading(false);
            setPlaylistItemsError('');
            return;
        }

        const fetchPlaylistItems = async () => {
            try {
                setIsPlaylistItemsLoading(true);
                setPlaylistItemsError('');
                const response = await fetch('/api/v1/playlist-items', {
                    credentials: 'include', 
                });
                
                if (!response.ok) {
                    setPlaylistItemsError('Unable to load your playlist items. Please try again.')
                    return;
                }

                const playlistItemsData = await response.json();

                const matchingPlaylistItems = playlistItemsData.filter(playlistItem => playlistItem.playlist_id === selectedPlaylist.id)

                setPlaylistItems(matchingPlaylistItems);
            } catch (error) {
                setPlaylistItemsError(error.message);
            } finally {
                setIsPlaylistItemsLoading(false);
            }
        };

        fetchPlaylistItems();
    }, [selectedPlaylist]);
    
    function formatRecordingTitle(recording) {
        if (recording.version === 'Original') {
            return recording.Song.title
        }

        return `${recording.Song.title} (${recording.version})`
    };

    async function handleFavorite(recordingId) {
        const favoriteToRemove = favorites.find(
            fav => fav.recording_id === recordingId
        );

        if (favoriteToRemove) {
            const response = await fetch(`/api/v1/favorites/${favoriteToRemove.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                return
            }

            setFavorites(prevFavorites => prevFavorites.filter(fav => fav.recording_id !== recordingId))
            return
        }

        const response = await fetch('/api/v1/favorites', {
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json',
                },
            credentials: 'include',
            body: JSON.stringify({
                recording_id: recordingId,
            }),
        });

        if (!response.ok) {
            return
        }

        const favoriteData = await response.json();

        setFavorites(prevFavorites => [...prevFavorites, favoriteData])
    };

    async function handleCreatePlaylist() {
        const playlistName = newPlaylistName;
        if (playlistName.trim() === '') {
            return
        }
        
        const response = await fetch('/api/v1/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                name: playlistName,
            }),
        });

        if (!response.ok) {
            return
        }

        const playlistData = await response.json();

        setPlaylists(prevPlaylists => [...prevPlaylists, playlistData])
        setNewPlaylistName('')
    };

    async function handleDeletePlaylist(playlistId) {
        const response = await fetch(`/api/v1/playlists/${playlistId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                return
            }

            setPlaylists(prevPlaylists => prevPlaylists.filter(playlist => playlist.id !== playlistId))

            if (playlistId === selectedPlaylist?.id) {
                setSelectedPlaylist(null)
                setPlaylistItems([])
            }
    };

    function handleEditPlaylistName(playlistId) {
        const playlistToEdit = playlists.find(
            playlist => playlist.id === playlistId
        );
        if (!playlistToEdit) {
            return
        }

        setEditPlaylistId(playlistToEdit.id)
        setEditPlaylistName(playlistToEdit.name)
    };

    async function handleUpdatePlaylist(playlistId) {
        const playlistName = editPlaylistName;
        if (playlistName.trim() === '') {
            return
        }
        const response = await fetch(`/api/v1/playlists/${playlistId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                name: playlistName,
            }),
        });

        if (!response.ok) {
            return
        }

        const updatedPlaylistData = await response.json();
        setPlaylists(prevPlaylists => prevPlaylists.map(playlist => {
            if (playlist.id === playlistId) {
                return updatedPlaylistData
            }
            return playlist
        }))

        if (playlistId === selectedPlaylist?.id) {
            setSelectedPlaylist(updatedPlaylistData)
        }
        setEditPlaylistName('')
        setEditPlaylistId(null)
    };

    function handleCancelEdit() {
        setEditPlaylistName('')
        setEditPlaylistId(null)
    };

    async function handleAddToPlaylist(recordingId) {
        if (!selectedPlaylist) {
            return
        }

        const response = await fetch('/api/v1/playlist-items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                playlist_id: selectedPlaylist.id,
                recording_id: recordingId,
                position: playlistItems.length + 1
            }),
        });

        if (!response.ok) {
            return
        }

        const playlistItemData = await response.json();
        setPlaylistItems(prevPlaylistItems => [...prevPlaylistItems, playlistItemData])
    };

    async function handleRemoveFromPlaylist(playlistItemId) {
        const response = await fetch(`/api/v1/playlist-items/${playlistItemId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            return
        }

        setPlaylistItems(prevPlaylistItems => prevPlaylistItems.filter(item => item.id !== playlistItemId).map((remainingItem, index) => {
            return {
                ...remainingItem,
                position: index + 1
            }
        }))
    };

    async function handleMovePlaylistItemUp(playlistItem) {
        if (playlistItem.position === 1) {
            return
        }

        const response = await fetch(`/api/v1/playlist-items/${playlistItem.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                playlist_id: playlistItem.playlist_id,
                recording_id: playlistItem.recording_id,
                position: playlistItem.position - 1
            }),
        });

        if (!response.ok) {
            return
        }

        setPlaylistItems(prevPlaylistItems => prevPlaylistItems.map(item => {
            if (item.id === playlistItem.id) {
                return {
                    ...item,
                    position: item.position - 1
                }
            } else if (item.position === playlistItem.position - 1) {
                return {
                    ...item,
                    position: item.position + 1
                }
            }
            return item
        }).sort((a, b) => a.position - b.position))
    };

    async function handleMovePlaylistItemDown(playlistItem) {
        if (playlistItem.position === playlistItems.length) {
            return
        }

        const response = await fetch(`/api/v1/playlist-items/${playlistItem.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                playlist_id: playlistItem.playlist_id,
                recording_id: playlistItem.recording_id,
                position: playlistItem.position + 1
            }),
        });

        if (!response.ok) {
            return
        }

        setPlaylistItems(prevPlaylistItems => prevPlaylistItems.map(item => {
            if (item.id === playlistItem.id) {
                return {
                    ...item,
                    position: item.position + 1
                }
            } else if (item.position === playlistItem.position + 1) {
                return {
                    ...item,
                    position: item.position - 1
                }
            }
            return item
        }).sort((a, b) => a.position - b.position))
    };

    function handlePlaylistItemEnded() {
        if (playbackQueue.length !== 0) {
            setSelectedRecording(playbackQueue[0])
            setPlaybackQueue(prevPlaybackQueue => prevPlaybackQueue.filter((_, index) => index !== 0))
            setAutoPlay(true)
            return
        }

        const currentPlaylistItem = playlistItems.find(item => item.recording_id === selectedRecording.id);
        if (!currentPlaylistItem) {
            return
        }
        
        const nextPlaylistItem = playlistItems.find(item => item.position === currentPlaylistItem.position + 1);
        
        if (nextPlaylistItem) {
            setSelectedRecording(nextPlaylistItem.Recording)
            setAutoPlay(true)
        }
    };

    function handlePlay(recording) {
        setSelectedRecording(recording);
        setAutoPlay(false)
    };

    function handleAddToQueue(recording) {
        setPlaybackQueue(prevPlaybackQueue => [...prevPlaybackQueue, recording])
    };

    function handleRemoveFromQueue(indexToRemove) {
        setPlaybackQueue(prevPlaybackQueue => prevPlaybackQueue.filter((_, index) => index !== indexToRemove))
    };

    function handleClearQueue() {
        setPlaybackQueue([])
    };

    async function handleResetDemo() {
        try {
            setIsResetting(true);
            const response = await fetch('/api/v1/demo/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                console.log('failed fetch')
                return
            };

            console.log('success');
            setPlaylists([]);
            setSelectedPlaylist(null);
            setPlaylistItems([]);
            setFavorites([]);
            setPlaybackQueue([]);
            setSelectedRecording(null);
            setAutoPlay(false);
        } catch {
            console.log('failed fetch');
            return
        } finally {
            setIsResetting(false);
        }
    };

    let libraryContent;
    if (isRecordingsLoading) {
        libraryContent = <p className="library-message">Loading your library...</p>;
    } else if (recordingsError) {
        libraryContent = <p className="library-message library-error">{recordingsError}</p>;
    } else if (recordings.length !== 0) {
        libraryContent = <ul className="recordings-list">
            {recordings.map(recording => {
                const isFavorite = favorites.some(fav => fav.recording_id === recording.id)
                return <li key={recording.id} className={`recording-item ${selectedRecording?.id === recording.id ? 'recording-selected' : ''}`}>
                    <button 
                        type="button"
                        className="recording-button" 
                        onClick={() => handlePlay(recording)}
                    >
                        {formatRecordingTitle(recording)}
                    </button>
                    <button type="button" onClick={() => handleAddToQueue(recording)}>Add to Queue</button>
                    <button type="button" onClick={() => handleAddToPlaylist(recording.id)}>Add to Playlist</button>
                    <button 
                        type="button" 
                        className={`favorite-button ${isFavorite ? 'favorite-active' : ''}`}
                        aria-label={isFavorite ? 'Unfavorite recording' : 'Favorite recording'} 
                        aria-pressed={isFavorite} 
                        onClick={() => handleFavorite(recording.id)}
                    >
                        {isFavorite ? 'unfavorite' : 'favorite'}
                    </button>
                </li>
            })}
        </ul>
    } else {
        libraryContent = <p className="library-message">No recordings found in your library.</p>
    };

    let playlistsContent;
    if (isPlaylistsLoading) {
        playlistsContent = <p>Playlists loading...</p>;
    } else if (playlistsError) {
        playlistsContent = <p>{playlistsError}</p>;
    } else if (playlists.length === 0) {
        playlistsContent = <p>No playlists found</p>;
    } else {
        playlistsContent = <ul>
            {playlists.map(playlist => 
                editPlaylistId === playlist.id ? 
                    <li key={playlist.id}>
                        <input 
                            type="text" 
                            value={editPlaylistName} 
                            onChange={(event) => setEditPlaylistName(event.target.value)} 
                        />
                        <button type="button" onClick={() => handleUpdatePlaylist(playlist.id)}>Save</button>
                        <button type="button" onClick={handleCancelEdit}>Cancel</button>
                    </li> :
                    <li key={playlist.id}>
                        <button type="button" onClick={() => setSelectedPlaylist(playlist)}>{playlist.name}</button>
                        <button type="button" onClick={() => handleEditPlaylistName(playlist.id)}>Edit Playlist</button>
                        <button type="button" onClick={() => handleDeletePlaylist(playlist.id)}>Delete Playlist</button>
                    </li>
                )}
            </ul>
    };

    let favoritesContent;
    if (isFavoritesLoading) {
        favoritesContent = <p>Favorites loading...</p>
    } else if (favoritesError) {
        favoritesContent = <p>{favoritesError}</p>
    } else if (favorites.length === 0) {
        favoritesContent = <p>No favorites found</p>
    };

    let playlistItemsContent;
    if (isPlaylistItemsLoading) {
        playlistItemsContent = <p>Playlist items loading...</p>
    } else if (playlistItemsError) {
        playlistItemsContent = <p>{playlistItemsError}</p>
    } else if (playlistItems.length === 0) {
        playlistItemsContent = <p>No songs in this playlist</p>
    } else {
        playlistItemsContent = <ul>{playlistItems.map(item => 
            <li key={item.id}>
                {item.position}. {item.Recording.Song.title} - {item.Recording.Song.Artist.name}
                <button 
                    type="button" 
                    disabled={item.position === 1} 
                    onClick={() => handleMovePlaylistItemUp(item)}
                >
                    Move Up
                </button>
                <button 
                    type="button" 
                    disabled={item.position === playlistItems.length} 
                    onClick={() => handleMovePlaylistItemDown(item)}
                >
                    Move Down
                </button>
                <button type="button" onClick={() => handleRemoveFromPlaylist(item.id)}>Delete Song</button>
            </li>
        )}</ul>
    };

    let recordingCount;
    if (!isRecordingsLoading && !recordingsError) {
        if (recordings.length === 1) {
            recordingCount = <span className="recording-count">{recordings.length} recording</span>
        } else {
            recordingCount = <span className="recording-count">{recordings.length} recordings</span>
        }
    };

    let queueContent;
    if (playbackQueue.length === 0) {
        queueContent = <p>Queue is empty</p>
    } else {
        queueContent = <ul>{playbackQueue.map((recording, index) => 
            <li key={index}>
                {formatRecordingTitle(recording)}
                <button type="button" onClick={() => handleRemoveFromQueue(index)}>Remove from queue</button>
            </li>
        )}</ul>
    };

    let selectedPlaylistContent;
    if (!selectedPlaylist) {
        selectedPlaylistContent = <p>No playlist selected</p>
    } else {
        selectedPlaylistContent = <div>
            <p>Selected Playlist</p>
            <p>{selectedPlaylist.name}</p>
            {playlistItemsContent}
        </div>
    };

    let userContent = <div className="app-layout">
        <header className="app-header">SoundVault</header>
        <aside className="app-sidebar">
            <nav>
                <ul>
                    <li><a>Home</a></li>
                    <li><a>Search</a></li>
                    <li><a>Library</a></li>
                </ul>
            </nav>
        </aside>

        <main className="app-main">
            <div className="main-toolbar">
                <h1>Welcome to SoundVault!</h1>
                <button 
                    type='button' 
                    className='reset-demo-button' 
                    onClick={handleResetDemo} 
                    disabled={isResetting}
                >
                    {isResetting ? 'Resetting...' : 'Reset demo'}
                </button>
            </div>

            <DemoInfo />

            <section className="library-preview">
                <h2>Your Library
                    {recordingCount}
                </h2>
                {libraryContent}
                {favoritesContent}
            </section>

            <section>
                <h2>Your Playlists</h2>
                <input 
                    type="text" 
                    value={newPlaylistName} 
                    onChange={(event) => setNewPlaylistName(event.target.value)}
                />
                <button type="button" onClick={handleCreatePlaylist}>Create Playlist</button>

                {playlistsContent}
            </section>

            {selectedPlaylistContent}

            <h2>Queue</h2>
            <button type="button" onClick={handleClearQueue}>Clear queue</button>
            {queueContent}

            <MusicCredits />

        </main>
        
        <PlayerBar 
            title={selectedRecording ? formatRecordingTitle(selectedRecording) : null} 
            audioUrl={selectedRecording?.audio_url || null}
            onEnded={handlePlaylistItemEnded}
            autoPlay={autoPlay}
        />
    </div>

    return (
        <div>
            {userContent}
        </div>
    )
};