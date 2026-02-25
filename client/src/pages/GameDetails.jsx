import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGameById, getGameProgress, getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GAME_ICONS, CAT_COLORS } from '../components/GameCard';

export default function GameDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [game, setGame] = useState(null);
    const [progress, setProgress] = useState(null);
    const [lb, setLb] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getGameById(id).then(r => {
            setGame(r.data);
            return Promise.all([
                user ? getGameProgress(id).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
                getLeaderboard(id).catch(() => ({ data: [] }))
            ]);
        }).then(([p, l]) => {
            setProgress(p.data);
            setLb(l.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [id, user]);

    if (loading) return <div className="page page-enter"><div className="loader"><div className="loader-spinner" /><span className="loader-text">Loading...</span></div></div>;
    if (!game) return <div className="page page-enter" style={{ textAlign: 'center', paddingTop: 120 }}><div style={{ fontSize: '3rem' }}>😢</div><h2>Not Found</h2><Link to="/games" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Games</Link></div>;

    const icon = GAME_ICONS[game.title] || '🎮';
    const bg = CAT_COLORS[game.category] || 'var(--grad1)';

    return (
        <div className="page page-enter">
            <div className="gd-hero">
                <div className="gd-img" style={{ background: bg }}>
                    <span style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.3))' }}>{icon}</span>
                </div>
                <div className="gd-info">
                    <h1>{game.title}</h1>
                    <div className="gd-meta">
                        <span className="pill pill-cat">{game.category}</span>
                        <span className="pill pill-players">{game.players}</span>
                        <span style={{ fontSize: '.85rem', color: 'var(--text-sub)' }}>⭐ {game.rating?.toFixed(1)}</span>
                        <span style={{ fontSize: '.85rem', color: 'var(--text-sub)' }}>🎮 {game.plays?.toLocaleString()} plays</span>
                    </div>
                    <p className="gd-desc">{game.description}</p>
                    {game.controls && <div className="gd-controls"><h4>🎯 Controls</h4><p>{game.controls}</p></div>}
                    <div className="gd-actions">
                        <button type="button" className="btn btn-primary" onClick={() => navigate(`/play/${game._id}`)}>▶ Play Now</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/games')}>← Back</button>
                    </div>
                    {user && progress && progress.bestScore > 0 && (
                        <div className="gd-score"><h4>🏆 Your Best</h4><div className="val">{progress.bestScore.toLocaleString()}</div></div>
                    )}
                </div>
            </div>

            {lb.length > 0 && (
                <div style={{ marginTop: 36 }}>
                    <h2 className="section-title">🏆 Leaderboard</h2>
                    <p className="section-sub">Top players for {game.title}</p>
                    <table className="lb-table">
                        <thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Time</th></tr></thead>
                        <tbody>
                            {lb.map(e => (
                                <tr key={e.rank} className={e.rank <= 3 ? `r${e.rank}` : ''}>
                                    <td><span className="rank-b">{e.rank}</span></td>
                                    <td>{e.player}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--purple)' }}>{e.score?.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{Math.floor((e.time || 0) / 60)}m</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
