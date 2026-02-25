import { useState, useEffect, useRef, useCallback } from 'react';

const TIME = 20;

export default function QuickAim({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME);
    const [target, setTarget] = useState(null);
    const areaRef = useRef(null);

    const spawnTarget = () => {
        setTarget({
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            size: 25 + Math.random() * 30,
            id: Date.now()
        });
    };

    const reset = useCallback(() => {
        setScore(0); setTimeLeft(TIME); spawnTarget(); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const timer = setInterval(() => {
            setTimeLeft(t => { if (t <= 1) { setPhase('end'); return 0; } return t - 1; });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);

    useEffect(() => { if (phase === 'end') onScoreUpdate?.(score); }, [phase]);

    const hit = () => {
        setScore(s => s + 1);
        spawnTarget();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Quick Aim</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Click targets as fast as you can! {TIME} seconds.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#6BCB77' }}>Score: {score}</span>
                        <span style={{ color: timeLeft <= 5 ? '#FF6B6B' : '#B8C1EC' }}>⏱ {timeLeft}s</span>
                    </div>
                    <div ref={areaRef} style={{ position: 'relative', width: '100%', height: 400, background: '#1B1E3F', borderRadius: 16, cursor: 'crosshair', overflow: 'hidden' }}>
                        {target && (
                            <button type="button" key={target.id} onClick={hit} style={{
                                position: 'absolute', left: `${target.x}%`, top: `${target.y}%`,
                                width: target.size, height: target.size, borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 35%, #FF6B6B, #ef4444)',
                                border: '3px solid #FFD93D', cursor: 'crosshair',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 15px #FF6B6B44', animation: 'pulse 1s infinite'
                            }} />
                        )}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>⏱ Time's Up!</h3>
                    <p style={{ fontSize: '2rem', fontFamily: 'Orbitron', color: '#6BCB77', marginBottom: 12 }}>Score: {score} 🎯</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
