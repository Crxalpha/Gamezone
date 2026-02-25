const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'gamezone_secret_2024';

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });
        const user = new User({ name, email, passwordHash: password });
        await user.save();
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out.' });
});

router.put('/favorites', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        const user = await User.findById(req.user.id);
        const idx = user.favorites.indexOf(gameId);
        if (idx > -1) user.favorites.splice(idx, 1);
        else user.favorites.push(gameId);
        await user.save();
        res.json({ favorites: user.favorites });
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
