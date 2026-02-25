const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    players: { type: String, default: '1P' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    thumbnailURL: { type: String, default: '' },
    component: { type: String, default: '' },
    controls: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    plays: { type: Number, default: 0 },
    rating: { type: Number, default: 4.0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
