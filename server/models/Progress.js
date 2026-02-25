const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    bestScore: { type: Number, default: 0 },
    lastScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalTimePlayed: { type: Number, default: 0 },
    lastPlayedAt: { type: Date, default: Date.now }
});

progressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
