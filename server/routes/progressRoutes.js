const express = require('express');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/save', auth, async (req, res) => {
    try {
        const { gameId, score, level, timePlayed } = req.body;
        const userId = req.user.id;
        let progress = await Progress.findOne({ userId, gameId });
        if (progress) {
            progress.lastScore = score || 0;
            progress.bestScore = Math.max(progress.bestScore, score || 0);
            progress.level = Math.max(progress.level, level || 1);
            progress.totalTimePlayed = (progress.totalTimePlayed || 0) + (timePlayed || 0);
            progress.lastPlayedAt = Date.now();
        } else {
            progress = new Progress({ userId, gameId, bestScore: score || 0, lastScore: score || 0, level: level || 1, totalTimePlayed: timePlayed || 0, lastPlayedAt: Date.now() });
        }
        await progress.save();
        res.json(progress);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.get('/me', auth, async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.user.id }).populate('gameId').sort({ lastPlayedAt: -1 });
        res.json(progress);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.get('/me/:gameId', auth, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id, gameId: req.params.gameId });
        res.json(progress || { bestScore: 0, lastScore: 0, level: 1, totalTimePlayed: 0 });
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
