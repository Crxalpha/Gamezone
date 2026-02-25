import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGames, toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GameCard, { GAME_ICONS, CAT_COLORS } from '../components/GameCard';

const CATS = [
    { name: '1P', icon: '🎮', filter: '1P' },
    { name: '2P', icon: '👥', filter: '2P' },
    { name: '4P', icon: '👨‍👩‍👧‍👦', filter: '4P' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Arcade', icon: '👾' },
    { name: 'Puzzle', icon: '🧩' },
    { name: 'Brain', icon: '🧠' },
];

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([getGames({ featured: 'true' }), getGames({ sort: 'trending' })])
            .then(([f, t]) => { setFeatured(f.data); setTrending(t.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleFav = async (gid) => {
        if (!user) return navigate('/login');
        try { await toggleFavorite(gid); } catch { }
    };

    return (
        <div className="page-enter">
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-badge"><span className="dot" /><span>Free Party Games</span></div>
                    <h1>Play Together,<br /><span className="grad">Have Fun</span></h1>
                    <p>30 free party games for 1–4 players. Play on the same device, track scores, challenge friends!</p>
                    <div className="hero-btns">
                        <Link to="/games" className="btn btn-primary">🎮 PLAY NOW</Link>
                        <Link to="/games?players=2P" className="btn btn-secondary">👥 2P / 4P GAMES</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="hs"><div className="hs-num">30+</div><div className="hs-lbl">Games</div></div>
                        <div className="hs"><div className="hs-num">4P</div><div className="hs-lbl">Multiplayer</div></div>
                        <div className="hs"><div className="hs-num">∞</div><div className="hs-lbl">Fun</div></div>
                    </div>
                </div>
                {/* Floating particles */}
                <div className="particles">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${4 + Math.random() * 4}s`,
                            fontSize: `${0.8 + Math.random() * 1.2}rem`,
                            opacity: 0.15 + Math.random() * 0.2
                        }}>
                            {['🎮', '⭐', '⚡', '🏆', '🎯', '🎲'][i % 6]}
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ padding: '0 16px 24px' }}>
                <div className="container">
                    <h2 className="section-title">📂 Categories</h2>
                    <p className="section-sub">Pick your vibe</p>
                    <div className="cat-row">
                        {CATS.map(c => (
                            <button type="button" key={c.name} className="cat-chip" onClick={() => navigate(`/games?${c.filter ? `players=${c.filter}` : `category=${c.name}`}`)}>
                                {c.icon} {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="feat-section">
                <div className="container">
                    <h2 className="section-title">🔥 Featured Games</h2>
                    <p className="section-sub">Hand-picked party favorites</p>
                    <div className="feat-row">
                        {loading ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="feat-card" style={{ opacity: .3 }}>
                                <div className="feat-img" style={{ background: 'var(--bg-glass)' }} />
                                <div className="feat-body"><h3>Loading...</h3></div>
                            </div>
                        )) : featured.slice(0, 6).map(g => (
                            <div key={g._id} className="feat-card" onClick={() => navigate(`/game/${g._id}`)}>
                                <span className="feat-badge">⭐ FEATURED</span>
                                <div className="feat-img" style={{ background: CAT_COLORS[g.category] || 'var(--grad1)' }}>
                                    <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.3))' }}>{GAME_ICONS[g.title] || '🎮'}</span>
                                </div>
                                <div className="feat-body">
                                    <h3>{g.title}</h3>
                                    <p>{g.description}</p>
                                    <div className="feat-foot">
                                        <span className="pill">{g.players}</span>
                                        <span className="plays">{g.plays?.toLocaleString()} plays</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '0 16px 60px' }}>
                <div className="container">
                    <h2 className="section-title">🚀 Trending Now</h2>
                    <p className="section-sub">Most played this week</p>
                    <div className="game-grid">
                        {trending.slice(0, 8).map(g => (
                            <GameCard key={g._id} game={g} onFavorite={handleFav} isFavorite={user?.favorites?.includes(g._id)} />
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Link to="/games" className="btn btn-secondary">View All 30 Games →</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
