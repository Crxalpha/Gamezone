const express = require('express');
const Progress = require('../models/Progress');
const router = express.Router();

router.get('/:gameId', async (req, res) => {
    try {
        const lb = await Progress.find({ gameId: req.params.gameId }).populate('userId', 'name').sort({ bestScore: -1 }).limit(10);
        const formatted = lb.map((e, i) => ({ rank: i + 1, player: e.userId?.name || 'Unknown', score: e.bestScore, time: e.totalTimePlayed }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
