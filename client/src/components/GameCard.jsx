import { useNavigate } from 'react-router-dom';

export const GAME_ICONS = {
    'Ping Pong': '🏓', 'Air Hockey': '🏒', 'Pool': '🎱', 'Penalty Kicks': '⚽', 'Mini Golf': '⛳',
    'Archery Duel': '🏹', 'Basketball Flick': '🏀', 'Bowling': '🎳', 'Boxing': '🥊', 'Darts': '🎯',
    'Spinner War': '🌀', 'Sumo Push': '🤼', 'Tap Race': '🏃', 'Reaction Tap': '⚡', 'Whack-a-Mole': '🐹',
    'Dodge Blocks': '💥', 'Knife Hit': '🔪', 'Balloon Pop': '🎈', 'Falling Tiles': '⬇️', 'Quick Aim': '🎯',
    'Tic Tac Toe': '❌', 'Connect 4': '🔴', 'Memory Cards': '🃏', 'Simon Says': '🎨', 'Number Match': '🔢',
    'Quick Math': '🧮', 'Word Guess': '📝', 'Chess Lite': '♟️', 'Backgammon Lite': '🎲', 'Ludo Lite': '🎲',
    // Legacy
    'Snake': '🐍', 'Reaction Time': '⚡', 'Quiz Sprint': '🧠',
    'Pong Duel': '🏓', '4 Corner Battle': '🎯', 'Quick Math Battle': '🔢',
};

export const CAT_COLORS = {
    'Arcade': 'linear-gradient(135deg,#06d6a0,#3b82f6)',
    'Puzzle': 'linear-gradient(135deg,#a855f7,#6366f1)',
    'Brain': 'linear-gradient(135deg,#fbbf24,#f97316)',
    '2 Player': 'linear-gradient(135deg,#f72585,#a855f7)',
    '4 Player': 'linear-gradient(135deg,#ef4444,#fb923c)',
    'Sports': 'linear-gradient(135deg,#10b981,#06d6a0)',
    'Action': 'linear-gradient(135deg,#FF6B6B,#FF9F1C)',
};

const TILE_GRADIENTS = [
    'linear-gradient(135deg, #FF6B6B, #FF9F1C)',
    'linear-gradient(135deg, #FFD93D, #FF9F1C)',
    'linear-gradient(135deg, #6BCB77, #4D96FF)',
    'linear-gradient(135deg, #4D96FF, #C77DFF)',
    'linear-gradient(135deg, #C77DFF, #FF6B6B)',
    'linear-gradient(135deg, #FF9F1C, #FFD93D)',
];

export default function GameCard({ game, onFavorite, isFavorite }) {
    const navigate = useNavigate();
    const icon = GAME_ICONS[game.title] || '🎮';
    const bg = CAT_COLORS[game.category] || TILE_GRADIENTS[game.title.length % TILE_GRADIENTS.length];

    return (
        <div className="game-tile animate-in" onClick={() => navigate(`/game/${game._id}`)}>
            <button type="button" className={`fav-btn ${isFavorite ? 'on' : ''}`} onClick={e => { e.stopPropagation(); onFavorite?.(game._id); }}>
                {isFavorite ? '❤️' : '🤍'}
            </button>
            <div className="tile-img" style={{ background: bg }}>
                <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))' }}>{icon}</span>
                <div className="play-ov"><div className="play-icon">▶</div></div>
            </div>
            <div className="tile-body">
                <h3>{game.title}</h3>
                <div className="tile-meta">
                    <span className="pill pill-cat">{game.category}</span>
                    <span className="pill pill-players">{game.players}</span>
                    <span className="rating">⭐ {game.rating?.toFixed(1)}</span>
                    <span className="plays">{game.plays?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
