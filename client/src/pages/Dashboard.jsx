import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProgress } from '../services/api';
import { GAME_ICONS, CAT_COLORS } from '../components/GameCard';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        getUserProgress().then(r => setProgress(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [user, navigate]);

    if (!user) return null;

    const totalGames = progress.length;
    const totalScore = progress.reduce((s, p) => s + (p.bestScore || 0), 0);
    const totalTime = progress.reduce((s, p) => s + (p.totalTimePlayed || 0), 0);

    const badges = [
        { label: '🎮 Gamer', cls: 'bdg-p' },
        ...(totalGames >= 3 ? [{ label: '⭐ Explorer', cls: 'bdg-b' }] : []),
        ...(totalScore >= 500 ? [{ label: '🏆 Champion', cls: 'bdg-g' }] : []),
        ...(totalGames >= 8 ? [{ label: '🔥 Completionist', cls: 'bdg-k' }] : []),
    ];

    return (
        <div className="page page-enter">
            <div className="dash-header animate-in">
                <div className="dash-av">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="dash-user">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <div className="dash-badges">{badges.map((b, i) => <span key={i} className={`bdg ${b.cls}`}>{b.label}</span>)}</div>
                </div>
            </div>

            <div className="dash-stats animate-in">
                <div className="ds-card"><div className="ds-icon">🎮</div><div className="ds-num">{totalGames}</div><div className="ds-lbl">Games Played</div></div>
                <div className="ds-card"><div className="ds-icon">🏆</div><div className="ds-num">{totalScore.toLocaleString()}</div><div className="ds-lbl">Total Score</div></div>
                <div className="ds-card"><div className="ds-icon">⏱️</div><div className="ds-num">{Math.floor(totalTime / 60)}m</div><div className="ds-lbl">Play Time</div></div>
                <div className="ds-card"><div className="ds-icon">⚡</div><div className="ds-num">{progress.length > 0 ? Math.max(...progress.map(p => p.bestScore || 0)) : 0}</div><div className="ds-lbl">Best Score</div></div>
            </div>

            {progress.length > 0 && progress[0]?.gameId && (
                <div style={{ marginBottom: 24 }}>
                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/play/${progress[0].gameId._id || progress[0].gameId}`)}>
                        ▶ Continue: {progress[0].gameId.title || 'Last Game'}
                    </button>
                </div>
            )}

            <div className="dash-section">
                <h3>🕹️ Recently Played</h3>
                {loading ? (
                    <div className="loader"><div className="loader-spinner" /></div>
                ) : progress.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        <p>No games played yet.</p>
                        <Link to="/games" className="btn btn-primary" style={{ marginTop: 12 }}>Start Playing!</Link>
                    </div>
                ) : (
                    <div className="prog-list">
                        {progress.map((p, i) => {
                            const g = p.gameId;
                            if (!g) return null;
                            const icon = GAME_ICONS[g.title] || '🎮';
                            const bg = CAT_COLORS[g.category] || 'var(--grad1)';
                            return (
                                <div key={i} className="prog-card" onClick={() => navigate(`/play/${g._id}`)}>
                                    <div className="pc-icon" style={{ background: bg }}>{icon}</div>
                                    <div className="pc-info">
                                        <h4>{g.title}</h4>
                                        <p>Last played {new Date(p.lastPlayedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="pc-score">
                                        <div className="sc">{p.bestScore?.toLocaleString()}</div>
                                        <div className="sl">Best Score</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
