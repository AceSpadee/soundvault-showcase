import { useState, useEffect, useRef } from 'react';

export default function PlayerBar({ title, audioUrl, onEnded, autoPlay }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackError, setPlaybackError] = useState('');
    const audioRef = useRef(null);

    useEffect(() => {
        resetPlayback();
        if (audioUrl && autoPlay) {
            handleAutoPlay();
        }
    
        async function handleAutoPlay() {
            try {
                await audioRef.current.play();
            } catch {
                handleAudioError();
            }
        }
    }, [audioUrl, autoPlay]);

    function resetPlayback() {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setDuration(0);
            setCurrentTime(0);
        }

        setPlaybackError('');
        setIsPlaying(false);
    };

    async function handlePlayPause() {
        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
                setPlaybackError('');
            }
        } catch {
            handleAudioError();
        }
    };

    function handleAudioError() {
        setPlaybackError('Unable to play recording');
        setIsPlaying(false);
    };
    
    function handleRecordingEnd() {
        setIsPlaying(false);
        onEnded();
    };

    function handleSeek(event) {
        const newCurrentTime = Number(event.target.value);

        audioRef.current.currentTime = newCurrentTime;
        setCurrentTime(newCurrentTime);
    };

    function handleVolumeChange(event) {
        const newVolume = Number(event.target.value);

        audioRef.current.volume = newVolume;

        setVolume(newVolume);
    };

    function handleMute() {
        const nextMuted = !isMuted;

        audioRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainder = Math.floor(seconds % 60);

        return minutes.toString() + ':' + remainder.toString().padStart(2, '0');
    };

    return (
        <div className="player-bar">
            <p className="player-track">{!title ? 'Select a recording' : `Now selected: ${title}`}</p>
            <button 
                type="button"
                className="player-toggle"
                disabled={!audioUrl}
                onClick={handlePlayPause}
                aria-pressed={isPlaying} aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </button>

            <audio 
                ref={audioRef}
                src={audioUrl || undefined}
                preload="metadata"
                onEnded={handleRecordingEnd}
                onLoadedMetadata={() => setDuration(audioRef.current.duration)}
                onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleAudioError}
            />

            <input 
                className="player-seek" 
                aria-label="Seek" 
                disabled={!audioUrl || duration === 0} 
                type="range" min="0" max={duration} 
                value={currentTime} 
                onChange={(event) => handleSeek(event)} 
            />
            <input 
                className="player-volume" 
                aria-label="Volume" 
                disabled={!audioUrl} 
                type="range" min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(event) => handleVolumeChange(event)} 
            />

            <button 
                type="button"
                className="player-mute"
                disabled={!audioUrl}
                onClick={handleMute}
                aria-pressed={isMuted} aria-label={isMuted ? 'Unmute recording' : 'Mute recording'}
            >
                {isMuted ? 'Unmute' : 'Mute'}
            </button>
            
            <p className="player-current-time">{formatTime(currentTime)}</p>
            <p className="player-duration">{formatTime(duration)}</p>

            {playbackError && <p className="player-error" role="alert">{playbackError}</p>}
        </div>
    )
};