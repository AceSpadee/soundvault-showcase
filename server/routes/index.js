import express from 'express';
import artistRoutes from './artistRoutes.js';
import songRoutes from './songRoutes.js';
import recordingRoutes from './recordingRoutes.js';
import audioFileRoutes from './audioFileRoutes.js';
import albumRoutes from './albumRoutes.js';
import releaseRoutes from './releaseRoutes.js';
import releaseTrackRoutes from './releaseTrackRoutes.js';
import recordingArtistRoutes from './recordingArtistRoutes.js';
import libraryRootRoutes from './libraryRootRoutes.js';
import scanRunRoutes from './scanRunRoutes.js';
import metadataMatchRoutes from './metadataMatchRoutes.js';
import userRoutes from './userRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import playlistItemRoutes from './playlistItemRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import listeningEventRoutes from './listeningEventRoutes.js';
import authRoutes from './authRoutes.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "server running"
    })
});

router.use('/auth', authRoutes);
router.use(requireAuth);

router.use('/artists', artistRoutes);
router.use('/songs', songRoutes);
router.use('/recordings', recordingRoutes);
router.use('/audio-files', audioFileRoutes);
router.use('/albums', albumRoutes);
router.use('/releases', releaseRoutes);
router.use('/release-tracks', releaseTrackRoutes);
router.use('/recording-artists', recordingArtistRoutes);
router.use('/library-roots', libraryRootRoutes);
router.use('/scan-runs', scanRunRoutes);
router.use('/metadata-matches', metadataMatchRoutes);
router.use('/users', requireAdmin, userRoutes);
router.use('/playlists', playlistRoutes);
router.use('/playlist-items', playlistItemRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/listening-events', listeningEventRoutes);

export default router;