const express = require('express');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, search, featured, players, sort } = req.query;
        let filter = {};
        if (category && category !== 'All') filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        if (players && players !== 'All') filter.players = { $regex: players.replace('P', ''), $options: 'i' };
        if (search) filter.title = { $regex: search, $options: 'i' };
        let sortObj = { createdAt: -1 };
        if (sort === 'trending') sortObj = { plays: -1 };
        if (sort === 'top') sortObj = { rating: -1 };
        const games = await Game.find(filter).sort(sortObj);
        res.json(games);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Game not found.' });
        game.plays += 1;
        await game.save();
        res.json(game);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
        const game = new Game(req.body);
        await game.save();
        res.status(201).json(game);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
