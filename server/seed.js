require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./models/Game');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gamezone';

const games = [
    // ===== A) DUEL CLASSICS / SPORTS (10) =====
    { title: 'Ping Pong', description: 'Classic table tennis! Move your paddle and outscore your opponent.', category: 'Sports', players: '2P', difficulty: 'Easy', component: 'PingPong', controls: 'P1: W/S keys. P2: Up/Down arrows.', isFeatured: true, plays: 2400, rating: 4.7 },
    { title: 'Air Hockey', description: 'Fast-paced air hockey action! Slide your mallet and score goals.', category: 'Sports', players: '2P', difficulty: 'Easy', component: 'AirHockey', controls: 'P1: WASD keys. P2: Arrow keys.', isFeatured: true, plays: 2100, rating: 4.6 },
    { title: 'Pool', description: 'Simplified 8-ball pool. Aim, set power, and sink the balls!', category: 'Sports', players: '2P', difficulty: 'Medium', component: 'Pool', controls: 'Click to aim, drag to set power, release to shoot.', isFeatured: false, plays: 1800, rating: 4.4 },
    { title: 'Penalty Kicks', description: 'Shooter vs Keeper! Pick your direction and try to score or save.', category: 'Sports', players: '2P', difficulty: 'Easy', component: 'PenaltyKicks', controls: 'Click a zone to shoot or dive. Players alternate turns.', isFeatured: true, plays: 1900, rating: 4.5 },
    { title: 'Mini Golf', description: 'Putt your way through! Aim and control power to sink the ball.', category: 'Sports', players: '2P', difficulty: 'Medium', component: 'MiniGolf', controls: 'Click and drag to aim and set power. Fewest strokes wins!', isFeatured: false, plays: 1500, rating: 4.3 },
    { title: 'Archery Duel', description: 'Take aim and hit the bullseye! Account for wind and distance.', category: 'Sports', players: '2P', difficulty: 'Medium', component: 'ArcheryDuel', controls: 'Click to set angle, click again to set power. Hit closest to center!', isFeatured: false, plays: 1400, rating: 4.2 },
    { title: 'Basketball Flick', description: 'Swipe to shoot hoops! Score as many baskets as you can.', category: 'Sports', players: '1-2P', difficulty: 'Easy', component: 'BasketballFlick', controls: 'Click and drag upward to shoot. Hit the basket!', isFeatured: true, plays: 2000, rating: 4.5 },
    { title: 'Bowling', description: 'Roll a strike! Line up your shot and knock down all the pins.', category: 'Sports', players: '1-2P', difficulty: 'Easy', component: 'Bowling', controls: 'Click to position, click to set angle, click to set power.', isFeatured: false, plays: 1600, rating: 4.3 },
    { title: 'Boxing', description: 'Punch timing battle! Attack and block at the right moment to win.', category: 'Sports', players: '2P', difficulty: 'Medium', component: 'Boxing', controls: 'P1: A=punch, S=block. P2: K=punch, L=block. Time it right!', isFeatured: false, plays: 1300, rating: 4.1 },
    { title: 'Darts', description: 'Hit the dartboard! Aim carefully for the bullseye.', category: 'Sports', players: '1-2P', difficulty: 'Easy', component: 'Darts', controls: 'Click to stop horizontal aim, click again for vertical, click to throw.', isFeatured: false, plays: 1700, rating: 4.4 },

    // ===== B) ARCADE REFLEX / TAP BATTLES (10) =====
    { title: 'Spinner War', description: '2P push-out arena! Spin and bump your opponent off the platform.', category: 'Arcade', players: '2P', difficulty: 'Easy', component: 'SpinnerWar', controls: 'P1: A/D to move. P2: Left/Right arrows. Push opponent out!', isFeatured: true, plays: 1800, rating: 4.4 },
    { title: 'Sumo Push', description: 'Sumo wrestling! Push your opponent out of the ring.', category: 'Arcade', players: '2P', difficulty: 'Easy', component: 'SumoPush', controls: 'P1: A/D + W to charge. P2: Arrows + Up to charge.', isFeatured: false, plays: 1500, rating: 4.3 },
    { title: 'Tap Race', description: 'Who taps faster? Race to the finish by mashing your button!', category: 'Arcade', players: '2P', difficulty: 'Easy', component: 'TapRace', controls: 'P1: tap left button. P2: tap right button. First to 100 wins!', isFeatured: true, plays: 2200, rating: 4.6 },
    { title: 'Reaction Tap', description: 'Test your reflexes! Tap when the color changes — 1 to 4 players.', category: 'Arcade', players: '1-4P', difficulty: 'Easy', component: 'ReactionTap', controls: 'Each player has a zone. Tap when it turns GREEN!', isFeatured: true, plays: 2000, rating: 4.5 },
    { title: 'Whack-a-Mole', description: 'Whack the moles before they hide! How many can you hit?', category: 'Arcade', players: '1-2P', difficulty: 'Easy', component: 'WhackAMole', controls: 'Click/tap moles as they pop up. Avoid the bombs!', isFeatured: true, plays: 2300, rating: 4.7 },
    { title: 'Dodge Blocks', description: 'Dodge the falling blocks! Survive as long as you can.', category: 'Arcade', players: '1-2P', difficulty: 'Medium', component: 'DodgeBlocks', controls: 'Arrow keys or tap sides to move. Avoid falling blocks!', isFeatured: true, plays: 1900, rating: 4.4 },
    { title: 'Knife Hit', description: 'Throw knives at the spinning log! Don\'t hit another knife.', category: 'Arcade', players: '1-2P', difficulty: 'Medium', component: 'KnifeHit', controls: 'Click/tap to throw a knife. Avoid hitting other knives!', isFeatured: false, plays: 1600, rating: 4.3 },
    { title: 'Balloon Pop', description: 'Pop the balloons before they float away! Fastest popper wins.', category: 'Arcade', players: '1-4P', difficulty: 'Easy', component: 'BalloonPop', controls: 'Click/tap balloons to pop them. Each player has a color zone!', isFeatured: false, plays: 1700, rating: 4.4 },
    { title: 'Falling Tiles', description: 'Survive the falling tiles! Move between safe gaps.', category: 'Arcade', players: '1-4P', difficulty: 'Medium', component: 'FallingTiles', controls: 'P1: A/D. P2: Arrows. Dodge tiles, last one standing wins!', isFeatured: false, plays: 1400, rating: 4.2 },
    { title: 'Quick Aim', description: 'Shoot the targets as fast as you can! Accuracy matters.', category: 'Arcade', players: '1-2P', difficulty: 'Medium', component: 'QuickAim', controls: 'Click targets as they appear. Faster = more points!', isFeatured: false, plays: 1500, rating: 4.3 },

    // ===== C) BOARD / BRAIN / PUZZLE (10) =====
    { title: 'Tic Tac Toe', description: 'Classic X and O! Play against CPU or a friend on the same device.', category: 'Puzzle', players: '1-2P', difficulty: 'Easy', component: 'TicTacToe', controls: 'Tap a cell to place your mark. Get 3 in a row to win!', isFeatured: true, plays: 2800, rating: 4.7 },
    { title: 'Connect 4', description: 'Drop your discs and connect 4 in a row to win!', category: 'Puzzle', players: '1-2P', difficulty: 'Easy', component: 'Connect4', controls: 'Click a column to drop your disc. 4 in a row wins!', isFeatured: true, plays: 2200, rating: 4.6 },
    { title: 'Memory Cards', description: 'Flip and match pairs! Test your memory with colorful cards.', category: 'Puzzle', players: '1-2P', difficulty: 'Easy', component: 'MemoryCards', controls: 'Click/tap cards to flip. Match all pairs to win!', isFeatured: true, plays: 2100, rating: 4.5 },
    { title: 'Simon Says', description: 'Follow the color sequence! How long can you remember?', category: 'Brain', players: '1-2P', difficulty: 'Medium', component: 'SimonSays', controls: 'Watch the sequence, then tap colors in the same order!', isFeatured: false, plays: 1700, rating: 4.4 },
    { title: 'Number Match', description: 'Merge matching numbers! A mini 2048-style puzzle.', category: 'Brain', players: '1P', difficulty: 'Medium', component: 'NumberMatch', controls: 'Arrow keys or swipe to slide tiles. Merge matching numbers!', isFeatured: false, plays: 1800, rating: 4.5 },
    { title: 'Quick Math', description: 'Math showdown! Fastest correct answer scores a point.', category: 'Brain', players: '2-4P', difficulty: 'Medium', component: 'QuickMath', controls: 'Each player has answer buttons. First correct answer wins the round!', isFeatured: true, plays: 1600, rating: 4.3 },
    { title: 'Word Guess', description: 'Guess the hidden word letter by letter before time runs out!', category: 'Brain', players: '1-2P', difficulty: 'Medium', component: 'WordGuess', controls: 'Click letters to guess. Solve the word before running out of tries!', isFeatured: false, plays: 1500, rating: 4.2 },
    { title: 'Chess Lite', description: 'Simplified mini chess on a 6x6 board. Quick strategic battles!', category: 'Puzzle', players: '2P', difficulty: 'Hard', component: 'ChessLite', controls: 'Click a piece to select, click a highlighted square to move.', isFeatured: false, plays: 1200, rating: 4.1 },
    { title: 'Backgammon Lite', description: 'Classic backgammon simplified! Roll dice and race your pieces home.', category: 'Puzzle', players: '2P', difficulty: 'Hard', component: 'BackgammonLite', controls: 'Roll dice, click pieces to move them. First to bear off all pieces wins!', isFeatured: false, plays: 1100, rating: 4.0 },
    { title: 'Ludo Lite', description: 'Race your tokens around the board! Roll dice and reach home first.', category: 'Puzzle', players: '2-4P', difficulty: 'Easy', component: 'LudoLite', controls: 'Roll dice, click a token to move. First to get all tokens home wins!', isFeatured: true, plays: 2000, rating: 4.5 },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        await Game.deleteMany({});
        console.log('Cleared games');
        await Game.insertMany(games);
        console.log(`Seeded ${games.length} games!`);
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
