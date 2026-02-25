import { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D'];

export default function SimonSays({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [sequence, setSequence] = useState([]);
    const [playerSeq, setPlayerSeq] = useState([]);
    const [activeColor, setActiveColor] = useState(null);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [msg, setMsg] = useState('');

    const reset = useCallback(() => {
        setSequence([]); setPlayerSeq([]); setScore(0); setMsg(''); setPhase('play');
        setTimeout(() => addToSequence([]), 500);
    }, []);

    const addToSequence = (prev) => {
        const next = [...prev, Math.floor(Math.random() * 4)];
        setSequence(next); setIsPlaying(true); setMsg('Watch...');
        playSequence(next);
    };

    const playSequence = (seq) => {
        seq.forEach((c, i) => {
            setTimeout(() => { setActiveColor(c); }, i * 600);
            setTimeout(() => { setActiveColor(null); }, i * 600 + 400);
        });
        setTimeout(() => { setIsPlaying(false); setMsg('Your turn!'); setPlayerSeq([]); }, seq.length * 600 + 200);
    };

    const handleColorClick = (colorIdx) => {
        if (isPlaying) return;
        const newSeq = [...playerSeq, colorIdx];
        setPlayerSeq(newSeq);
        setActiveColor(colorIdx);
        setTimeout(() => setActiveColor(null), 200);

        if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
            setMsg('Wrong! Game Over'); setPhase('end');
            onScoreUpdate?.(score); return;
        }
        if (newSeq.length === sequence.length) {
            const newScore = score + 1;
            setScore(newScore); setMsg('Correct! 🎉');
            setTimeout(() => addToSequence(sequence), 1000);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎨</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Simon Says</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Watch the sequence, repeat it! How far can you go?</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Orbitron', fontSize: '.9rem', color: '#B8C1EC', marginBottom: 4 }}>Level: {score + 1}</p>
                    <p style={{ fontFamily: 'Orbitron', fontSize: '.8rem', color: '#FFD93D', marginBottom: 16, minHeight: 24 }}>{msg}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 260, margin: '0 auto' }}>
                        {COLORS.map((col, i) => (
                            <button type="button" key={i} onClick={() => handleColorClick(i)} disabled={isPlaying} style={{
                                width: 120, height: 120, borderRadius: 20, border: 'none', cursor: isPlaying ? 'default' : 'pointer',
                                background: col, opacity: activeColor === i ? 1 : 0.4,
                                transform: activeColor === i ? 'scale(1.08)' : 'scale(1)',
                                transition: 'all .15s', boxShadow: activeColor === i ? `0 0 30px ${col}` : 'none'
                            }} />
                        ))}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>Game Over!</h3>
                    <p style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: '#6BCB77', marginBottom: 12 }}>Score: {score} rounds</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
