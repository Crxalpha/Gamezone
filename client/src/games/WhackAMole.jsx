import { useState, useEffect, useRef, useCallback } from 'react';

const GRID = 4, TIME = 30;

export default function WhackAMole({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME);
    const [moles, setMoles] = useState(Array(GRID * GRID).fill(false));
    const [bombs, setBombs] = useState(Array(GRID * GRID).fill(false));
    const timerRef = useRef(null);
    const moleRef = useRef(null);

    const reset = useCallback(() => {
        setScore(0); setTimeLeft(TIME);
        setMoles(Array(GRID * GRID).fill(false)); setBombs(Array(GRID * GRID).fill(false));
        setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { setPhase('end'); return 0; }
                return t - 1;
            });
        }, 1000);
        moleRef.current = setInterval(() => {
            setMoles(() => {
                const m = Array(GRID * GRID).fill(false);
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) m[Math.floor(Math.random() * GRID * GRID)] = true;
                return m;
            });
            setBombs(() => {
                const b = Array(GRID * GRID).fill(false);
                if (Math.random() > 0.5) b[Math.floor(Math.random() * GRID * GRID)] = true;
                return b;
            });
        }, 800);
        return () => { clearInterval(timerRef.current); clearInterval(moleRef.current); };
    }, [phase]);

    useEffect(() => { if (phase === 'end') onScoreUpdate?.(score); }, [phase]);

    const whack = (i) => {
        if (bombs[i]) { setScore(s => Math.max(0, s - 5)); return; }
        if (moles[i]) {
            setScore(s => s + 1);
            setMoles(m => { const n = [...m]; n[i] = false; return n; });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🐹</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Whack-a-Mole</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Whack moles, avoid bombs! {TIME} seconds.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 350, margin: '0 auto 12px', fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#6BCB77' }}>Score: {score}</span>
                        <span style={{ color: timeLeft <= 5 ? '#FF6B6B' : '#B8C1EC' }}>⏱ {timeLeft}s</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: 8, maxWidth: 350, margin: '0 auto' }}>
                        {moles.map((m, i) => (
                            <button type="button" key={i} onClick={() => whack(i)} style={{
                                width: '100%', aspectRatio: 1, borderRadius: 16,
                                background: bombs[i] ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : m ? 'linear-gradient(135deg, #8B5E3C, #6B4423)' : '#1B1E3F',
                                border: `2px solid ${m ? '#A0744F' : bombs[i] ? '#ef4444' : '#333'}`,
                                fontSize: '1.8rem', cursor: 'pointer', transition: 'all .15s',
                                transform: m || bombs[i] ? 'scale(1)' : 'scale(0.85)', color: '#fff'
                            }}>
                                {bombs[i] ? '💣' : m ? '🐹' : '🕳️'}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>⏱ Time's Up!</h3>
                    <p style={{ fontSize: '2rem', fontFamily: 'Orbitron', color: '#6BCB77', marginBottom: 12 }}>Score: {score}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
