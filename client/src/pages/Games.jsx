import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getGames, toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';

const PLAYER_FILTERS = ['All', '1P', '2P', '1-2P', '2-4P', '1-4P'];
const CAT_FILTERS = ['All', 'Sports', 'Arcade', 'Puzzle', 'Brain'];
const SORT_OPTIONS = [
    { value: 'trending', label: '🔥 Trending' },
    { value: 'new', label: '✨ New' },
    { value: 'top', label: '⭐ Top Rated' },
];

export default function Games() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [playerFilter, setPlayerFilter] = useState(searchParams.get('players') || 'All');
    const [catFilter, setCatFilter] = useState(searchParams.get('category') || 'All');
    const [sort, setSort] = useState('trending');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const params = {};
        if (sort) params.sort = sort;
        getGames(params)
            .then(r => setGames(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [sort]);

    useEffect(() => {
        if (searchParams.get('players')) setPlayerFilter(searchParams.get('players'));
        if (searchParams.get('category')) setCatFilter(searchParams.get('category'));
    }, [searchParams]);

    const filtered = games.filter(g => {
        if (playerFilter !== 'All' && !g.players.includes(playerFilter.replace('P', ''))) return false;
        if (catFilter !== 'All' && g.category !== catFilter) return false;
        if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleFav = async (gid) => {
        if (!user) return navigate('/login');
        try { await toggleFavorite(gid); } catch { }
    };

    return (
        <div className="page page-enter">
            <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 4 }}>🎮 All Games</h1>
            <p className="section-sub">Browse all 30 party games</p>

            {/* Search bar */}
            <div style={{ marginBottom: 16 }}>
                <input
                    type="text" placeholder="🔍 Search games..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', maxWidth: 400, padding: '12px 16px', borderRadius: 14,
                        background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text)',
                        fontSize: '.9rem', fontFamily: 'var(--font-body)'
                    }}
                />
            </div>

            {/* Filter chips */}
            <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-head)' }}>PLAYERS</p>
                <div className="cat-row" style={{ paddingBottom: 8 }}>
                    {PLAYER_FILTERS.map(f => (
                        <button type="button" key={f} className={`cat-chip ${playerFilter === f ? 'active' : ''}`} onClick={() => setPlayerFilter(f)}>
                            {f === 'All' ? '🎮 All' : `${f}`}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-head)' }}>CATEGORY</p>
                <div className="cat-row" style={{ paddingBottom: 8 }}>
                    {CAT_FILTERS.map(f => (
                        <button type="button" key={f} className={`cat-chip ${catFilter === f ? 'active' : ''}`} onClick={() => setCatFilter(f)}>
                            {f === 'All' ? '📂 All' : f}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-head)' }}>SORT:</span>
                {SORT_OPTIONS.map(o => (
                    <button type="button" key={o.value} className={`cat-chip ${sort === o.value ? 'active' : ''}`} onClick={() => setSort(o.value)}>
                        {o.label}
                    </button>
                ))}
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 12 }}>{filtered.length} games found</div>

            {loading ? (
                <div className="loader"><div className="loader-spinner" /><span className="loader-text">Loading games...</span></div>
            ) : (
                <div className="game-grid">
                    {filtered.map(g => (
                        <GameCard key={g._id} game={g} onFavorite={handleFav} isFavorite={user?.favorites?.includes(g._id)} />
                    ))}
                </div>
            )}
            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔍</div>
                    <p>No games found. Try different filters!</p>
                </div>
            )}
        </div>
    );
}
