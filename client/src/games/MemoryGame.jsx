import { useState, useEffect } from 'react';

const EMOJIS = ['🎮', '🎲', '🎯', '🏆', '⚡', '🔥', '💎', '🌟'];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function MemoryGame({ onScoreUpdate }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);

    const init = () => {
        setCards(shuffle([...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, key: `${e}-${i}` }))));
        setFlipped([]); setMatched([]); setMoves(0); setWon(false); setTimer(0); setRunning(false);
    };

    useEffect(() => { init(); }, []);
    useEffect(() => { let iv; if (running && !won) iv = setInterval(() => setTimer(t => t + 1), 1000); return () => clearInterval(iv); }, [running, won]);
    useEffect(() => { if (matched.length === EMOJIS.length * 2 && matched.length > 0) { setWon(true); setRunning(false); const sc = Math.max(1000 - moves * 20 - timer * 5, 100); onScoreUpdate?.(sc, 1); } }, [matched]);

    const click = (i) => {
        if (flipped.length === 2 || flipped.includes(i) || matched.includes(i) || won) return;
        if (!running) setRunning(true);
        const nf = [...flipped, i];
        setFlipped(nf);
        if (nf.length === 2) {
            setMoves(m => m + 1);
            if (cards[nf[0]].emoji === cards[nf[1]].emoji) { setMatched(p => [...p, nf[0], nf[1]]); setFlipped([]); }
            else setTimeout(() => setFlipped([]), 800);
        }
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="mg">
            <div className="mg-scores">
                <span>Moves: <strong>{moves}</strong></span>
                <span>Time: <strong>{fmt(timer)}</strong></span>
                <span>Pairs: <strong style={{ color: 'var(--cyan)' }}>{matched.length / 2}/{EMOJIS.length}</strong></span>
            </div>
            {won && <div style={{ padding: '12px 20px', background: 'rgba(6,214,160,.1)', border: '1px solid rgba(6,214,160,.3)', borderRadius: 'var(--r-md)', fontWeight: 700, color: 'var(--cyan)' }}>🎉 Score: {Math.max(1000 - moves * 20 - timer * 5, 100)}</div>}
            <div className="mem-board">
                {cards.map((c, i) => (
                    <div key={c.key} className={`mem-card ${flipped.includes(i) || matched.includes(i) ? 'flipped' : ''} ${matched.includes(i) ? 'matched' : ''}`} onClick={() => click(i)}>
                        <div className="mem-inner"><div className="mem-back">{c.emoji}</div><div className="mem-front">❓</div></div>
                    </div>
                ))}
            </div>
            <button type="button" className="btn btn-secondary" onClick={init}>🔄 New Game</button>
        </div>
    );
}
