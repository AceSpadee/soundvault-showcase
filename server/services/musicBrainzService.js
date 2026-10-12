// Stores the scheduled time of the most recent MusicBrainz request.
// This must stay outside respectRateLimit() so the value survives between calls.
let lastRequestTime = 0;


// pauses execution for a specified number of milliseconds.
// Used for rate limiting and retry delays.
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};


// Makes sure MusicBrainz requests are spaced at least one second apart.
// If multiple requests happen at the same time, each one reserves a future
// request slot so they do not all run together.
async function respectRateLimit() {
    const now = Date.now();
    const musicBrainzRateLimitMS = 1000;

    const allowedTime = Math.max(now, lastRequestTime + musicBrainzRateLimitMS)

    lastRequestTime = allowedTime;

    const difference = lastRequestTime - now;

    if (difference > 0) {
        await wait(difference)
    }
};


// Handles the HTTP request to MusicBrainz. Every request goes through the rate limiter first.
//
// If MusicBrainz responds with a 503 server-unavailable response, it waits two seconds and retries one time.
// 
// hasRetried prevents the request from retrying forever if the second request also receives a 503 response.
async function fetchMusicBrainz(url, hasRetried = false) {
    const musicBrainzRetryDelayMS = 2000;

    await respectRateLimit();

    let response = await fetch(url, {
        headers: {
            'User-Agent': `SoundVault/1.0 (${process.env.MUSICBRAINZ_CONTACT_EMAIL})`
        },
        signal: AbortSignal.timeout(10_000)
    });

    if (response.status === 503 && !hasRetried) {
        await wait(musicBrainzRetryDelayMS);
        response = await fetchMusicBrainz(url, true)
    }

    return response
};


// Calculates how many seconds apart the MusicBrainz recording duration and the local audio-file duration are.
// 
// MusicBrainz provides recording length in milliseconds while local duration is stored in seconds, so we convert first.
// 
// Infinity is returned when either duration is invalid so the recording cannot accidentally be considered a close duration match.
function getDurationDifference(recordingLength, localDuration) {
    if (!Number.isFinite(recordingLength) || !Number.isFinite(localDuration)) {
        return Infinity
    }

    const recordingSeconds = recordingLength / 1000;
    const difference = Math.abs(recordingSeconds - localDuration); 

    return difference;
};


// Determines whether the MusicBrainz recording duration is close enough to the local file duration to count as a duration match.
// 
// A difference of up to five seconds is allowed because metadata and encoding can cause small differences in reported durations.
function isDurationClose(recordingLength, localDuration) {
    // Allow small differences caused by metadata/encoding duration rounding.
    const maxDurationDifferenceSeconds = 5;

    const difference = getDurationDifference(recordingLength, localDuration)

    return difference <= maxDurationDifferenceSeconds
};


// Gets the earliest release year MusicBrainz provides for a recording.
// 
// MusicBrainz may return a date such as "1982-11-30", so only the first four characters are converted into the year.
// 
// Infinity is returned when the date is missing or invalid. This lets valid release years win during tie-breaking.
function getReleaseYear(recording) {
    const releaseDate = recording['first-release-date'];
    if (!releaseDate) {
        return Infinity
    }
    
    const convertedYear = Number(releaseDate.slice(0, 4))

    if (isNaN(convertedYear)) {
        return Infinity
    }
    
    return convertedYear
};


// Determines what version of a recording a MusicBrainz result appears to be.
// 
// MusicBrainz can describe a version in either the recording title or the disambiguation field, 
// so both are combined into one searchable string.
// 
// Whole-word regular expressions are used so words such as "deliver" do not accidentally match "live".
function classifyRecordingVersion(recording) {
    const versionSearchText = `${(recording.title ?? '').toLowerCase()} ${(recording.disambiguation ?? '').toLowerCase()}`;
    
    if (/\blive\b/.test(versionSearchText) && /\bedit\b/.test(versionSearchText)) {
        return "Live Edit"
    } else if (/\blive\b/.test(versionSearchText)) {
        return "Live"
    } else if (/\bkaraoke\b/.test(versionSearchText)) {
        return "Karaoke"
    } else if (/\bdolby atmos\b/.test(versionSearchText)) {
        return "Dolby Atmos"
    } else if (/\b360 reality audio\b/.test(versionSearchText)) {
        return "360 Reality Audio"
    } else if (/\bremix\b/.test(versionSearchText)) {
        return "Remix"
    } else if (/\binstrumental\b/.test(versionSearchText)) {
        return "Instrumental"
    } else if (/\bedit\b/.test(versionSearchText)) {
        return "Edit"
    } else {
        return "Original"
    }
};

// Checks whether the MusicBrainz recording version matches the version SoundVault is looking for.
function isVersionMatch(recording, desiredVersion) {
    const version = classifyRecordingVersion(recording);

    return version.toLowerCase() === desiredVersion.toLowerCase()
};


// Calculates a confidence score for one MusicBrainz recording.
//
// The score rewards:
// - exact title match
// - matching artist
// - similar duration
// - appearing on an official release
//
// The score penalizes:
// - the wrong recording version
// - video recordings
//
// This score is later used to decide which MusicBrainz candidate is the strongest match for the local audio file.
function calculateMatchConfidence(recording, title, artist, localDuration, desiredVersion) {
    let confidence = 0;
    const exactTitleMatchScore = 35;
    const artistMatchScore = 35;
    const durationCloseScore = 20;
    const officialReleaseScore = 10;
    const versionMismatchPenalty = -25;
    const videoRecordingPenalty = -25;

    if ((recording.title ?? '').toLowerCase() === title.toLowerCase()) {
        confidence += exactTitleMatchScore
    }
    if ((recording['artist-credit'] ?? []).some(art => (art.name ?? '').toLowerCase() === artist.toLowerCase())) {
        confidence += artistMatchScore;
    }

    if (isDurationClose(recording.length, localDuration)) {
        confidence += durationCloseScore;
    }

    if ((recording.releases ?? []).some(release => (release.status ?? '').toLowerCase() === 'official')) {
        confidence += officialReleaseScore;
    }

    if (!isVersionMatch(recording, desiredVersion)) {
        confidence += versionMismatchPenalty;
    }

    if (recording.video === true) {
        confidence += videoRecordingPenalty;
    }

    return confidence
};


// Filters the full MusicBrainz search response down to recordings that exactly match requested title and contain requested artist.
// 
// Missing MusicBrainz fields are treated as empty strings or arrays so incomplete API results do not crash the matcher.
function findCandidateRecordings(recordings, title, artist) {
    const candidates = [];

    for (let i = 0; i < recordings.length; i++) {
        if ((recordings[i].title ?? '').toLowerCase() === title.toLowerCase() &&
            (recordings[i]['artist-credit'] ?? []).some(art => (art.name ?? '').toLowerCase() === artist.toLowerCase())
        ) {
            candidates.push(recordings[i])
        }
    }

    return candidates
};


// Chooses the strongest MusicBrainz recording from the filtered candidates.
//
// Each candidate receives a confidence score.
//
// If one candidate has a higher score, it becomes the best candidate.
//
// If two candidates have the same score:
// 1. Prefer the recording with the earlier release year.
// 2. If the years are also equal, prefer the recording whose duration is closest to the local audio file.
//
// Returns both the chosen MusicBrainz recording and its confidence score.
function findBestCandidate(candidates, title, artist, localDuration, desiredVersion) {
    let bestCandidate = null;
    let bestConfidence = -1;

    for (let i = 0; i < candidates.length; i++) {
        const score = calculateMatchConfidence(candidates[i], title, artist, localDuration, desiredVersion)
        
        if (score > bestConfidence) {
            bestCandidate = candidates[i]
            bestConfidence = score
        } else if (score === bestConfidence) {
            const candidateYear = getReleaseYear(candidates[i]);
            const currentBestYear = getReleaseYear(bestCandidate);
            
            if (candidateYear < currentBestYear) {
                bestCandidate = candidates[i]
            } else if (candidateYear === currentBestYear) {
                const candidateDifference = getDurationDifference(candidates[i].length, localDuration);
                const bestDifference = getDurationDifference(bestCandidate.length, localDuration);

                if (candidateDifference < bestDifference) {
                    bestCandidate = candidates[i]
                }
            }
        }
    }

    return {
        recording: bestCandidate,
        confidence: bestConfidence
    }
};

// Determines whether a confidence score is high enough for SoundVault to consider the MusicBrainz result a confident match.
//
// Currently a score of 90 or higher is considered confident.
function isConfidentMatch(confidence) {
    // Scores at or above this can be automatically treated as confident matches.
    const minConfidentMatchScore = 90;

    return confidence >= minConfidentMatchScore
};


// Takes information from a local audio file:
// - title
// - artist
// - duration
// - desired recording version
//
// It then:
// 1. Builds a MusicBrainz recording search.
// 2. Sends the request through the rate-limited request helper.
// 3. Checks that the HTTP request succeeded.
// 4. Filters the returned recordings by title and artist.
// 5. Returns null if no candidates remain.
// 6. Scores the remaining candidates.
// 7. Returns the best MusicBrainz recording and confidence score.
async function searchRecording(title, artist, localDuration, desiredVersion = 'Original') {
    const query = `recording:"${title}" AND artist:"${artist}"`;
    
    const params = new URLSearchParams({
        query: query,
        fmt: 'json',
        limit: '100'
    });

    const url = `https://musicbrainz.org/ws/2/recording?${params.toString()}`;

    const response = await fetchMusicBrainz(url);

    if (!response.ok) {
        throw new Error(`MusicBrainz request failed: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data || !Array.isArray(data.recordings)) {
        throw new Error('Invalid MusicBrainz response: missing recordings array');
    }

    const candidates = findCandidateRecordings(data.recordings, title, artist);

    if (candidates.length === 0) {
        return null
    };

    const bestCandidate = findBestCandidate(candidates, title, artist, localDuration, desiredVersion);

    if (!isConfidentMatch(bestCandidate.confidence)) {
        return null
    }

    return bestCandidate
};

export default searchRecording;
export {
    respectRateLimit,
    getDurationDifference,
    isDurationClose, 
    getReleaseYear,
    classifyRecordingVersion,
    isVersionMatch,
    calculateMatchConfidence, 
    findCandidateRecordings, 
    findBestCandidate, 
    isConfidentMatch, 
};