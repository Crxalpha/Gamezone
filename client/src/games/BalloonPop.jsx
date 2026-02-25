import { useState, useEffect, useRef, useCallback } from 'react';

const TIME = 20, SPAWN_RATE = 600;
const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF', '#FF9F1C'];

export default function BalloonPop({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME);
    const [balloons, setBalloons] = useState([]);
    const idRef = useRef(0);

    const reset = useCallback(() => {
        setScore(0); setTimeLeft(TIME); setBalloons([]); idRef.current = 0; setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const timer = setInterval(() => {
            setTimeLeft(t => { if (t <= 1) { setPhase('end'); return 0; } return t - 1; });
        }, 1000);
        const spawner = setInterval(() => {
            setBalloons(b => [...b, {
                id: idRef.current++,
                x: 10 + Math.random() * 80,
                y: 105,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                speed: 0.3 + Math.random() * 0.4,
                size: 30 + Math.random() * 20,
            }]);
        }, SPAWN_RATE);
        const mover = setInterval(() => {
            setBalloons(b => b.map(bl => ({ ...bl, y: bl.y - bl.speed })).filter(bl => bl.y > -10));
        }, 50);
        return () => { clearInterval(timer); clearInterval(spawner); clearInterval(mover); };
    }, [phase]);

    useEffect(() => { if (phase === 'end') onScoreUpdate?.(score); }, [phase]);

    const pop = (id) => {
        setBalloons(b => b.filter(bl => bl.id !== id));
        setScore(s => s + 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎈</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Balloon Pop</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Pop as many balloons as you can in {TIME} seconds!</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#6BCB77' }}>Score: {score}</span>
                        <span style={{ color: timeLeft <= 5 ? '#FF6B6B' : '#B8C1EC' }}>⏱ {timeLeft}s</span>
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: 400, background: 'linear-gradient(180deg, #0a0a2a, #1B1E3F)', borderRadius: 16, overflow: 'hidden' }}>
                        {balloons.map(b => (
                            <button type="button" key={b.id} onClick={() => pop(b.id)} style={{
                                position: 'absolute', left: `${b.x}%`, bottom: `${100 - b.y}%`,
                                width: b.size, height: b.size * 1.3, borderRadius: '50%',
                                background: `radial-gradient(circle at 35% 35%, ${b.color}dd, ${b.color}88)`,
                                border: 'none', cursor: 'pointer', transition: 'transform .1s',
                                transform: 'translate(-50%, 50%)', boxShadow: `0 0 10px ${b.color}44`
                            }} />
                        ))}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>⏱ Time's Up!</h3>
                    <p style={{ fontSize: '2rem', fontFamily: 'Orbitron', color: '#6BCB77', marginBottom: 12 }}>Score: {score} 🎈</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
