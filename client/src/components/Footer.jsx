import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="footer-logo">🎮 GameZone</span>
                    <span className="footer-tagline">Party games for everyone</span>
                </div>
                <div className="footer-links">
                    <Link to="/games">Games</Link>
                    <span className="footer-sep">·</span>
                    <span>About</span>
                    <span className="footer-sep">·</span>
                    <span>Privacy</span>
                </div>
                <div className="footer-copy">© 2026 GameZone. Made with ❤️</div>
            </div>
        </footer>
    );
}
