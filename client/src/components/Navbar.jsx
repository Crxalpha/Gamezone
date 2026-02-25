import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGames } from '../services/api';

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showDrop, setShowDrop] = useState(false);
    const dropRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        if (q.trim().length > 1) {
            const t = setTimeout(() => {
                getGames({ search: q }).then(r => { setResults(r.data.slice(0, 5)); setShowResults(true); }).catch(() => { });
            }, 300);
            return () => clearTimeout(t);
        } else { setResults([]); setShowResults(false); }
    }, [q]);

    const active = (p) => location.pathname === p ? 'active' : '';

    return (
        <>
            <nav className="topnav">
                <div className="topnav-inner">
                    <Link to="/" className="topnav-logo">
                        <div className="icon">🎮</div>
                        <span>GameZone</span>
                    </Link>
                    <div className="topnav-links">
                        <Link to="/" className={active('/')}>Home</Link>
                        <Link to="/games" className={active('/games')}>Games</Link>
                        {user && <Link to="/dashboard" className={active('/dashboard')}>Profile</Link>}
                    </div>
                    <div className="topnav-search" ref={searchRef}>
                        <span className="s-icon">🔍</span>
                        <input placeholder="Search games..." value={q} onChange={e => setQ(e.target.value)} />
                        {showResults && results.length > 0 && (
                            <div className="search-results">
                                {results.map(g => (
                                    <div key={g._id} className="sr-item" onClick={() => { setQ(''); setShowResults(false); navigate(`/game/${g._id}`); }}>
                                        <span>{g.title}</span>
                                        <span className="sr-tag">{g.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="topnav-right">
                        {user ? (
                            <div style={{ position: 'relative' }} ref={dropRef}>
                                <div className="user-pill" onClick={() => setShowDrop(!showDrop)}>
                                    <div className="av">{user.name?.charAt(0).toUpperCase()}</div>
                                    <span className="nm">{user.name}</span>
                                </div>
                                {showDrop && (
                                    <div className="user-dropdown">
                                        <Link to="/dashboard" onClick={() => setShowDrop(false)}>📊 Dashboard</Link>
                                        <div className="divider" />
                                        <button type="button" onClick={() => { logoutUser(); setShowDrop(false); navigate('/'); }}>🚪 Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="auth-btn login-btn">Login</Link>
                                <Link to="/signup" className="auth-btn signup-btn">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <div className="bottomnav">
                <div className="bottomnav-inner">
                    <Link to="/" className={active('/')}>
                        <span className="bnav-icon">🏠</span>
                        <span>Home</span>
                    </Link>
                    <Link to="/games" className={active('/games')}>
                        <span className="bnav-icon">🎮</span>
                        <span>Games</span>
                    </Link>
                    <Link to="/games?search=1" className={active('/search')}>
                        <span className="bnav-icon">🔍</span>
                        <span>Search</span>
                    </Link>
                    <Link to={user ? '/dashboard' : '/login'} className={active('/dashboard') || active('/login')}>
                        <span className="bnav-icon">👤</span>
                        <span>Profile</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
