import express from 'express';
import artistRoutes from './artistRoutes.js';
import songRoutes from './songRoutes.js';
import recordingRoutes from './recordingRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import playlistItemRoutes from './playlistItemRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import listeningEventRoutes from './listeningEventRoutes.js';
import demoSession from '../middleware/demoSession.js';
import demoRoutes from './demoRoutes.js';
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "server running"
    })
});

router.use('/artists', artistRoutes);
router.use('/songs', songRoutes);
router.use('/recordings', recordingRoutes);

router.use(demoSession);
router.use('/demo', demoRoutes);
router.use('/playlists', playlistRoutes);
router.use('/playlist-items', playlistItemRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/listening-events', listeningEventRoutes);

export default router;