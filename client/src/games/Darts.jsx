import { useState, useEffect, useCallback } from 'react';

const ROUNDS = 3, DARTS_PER_ROUND = 3;
const RINGS = [
    { r: 15, pts: 50, color: '#FF6B6B', label: 'Bullseye' },
    { r: 35, pts: 25, color: '#6BCB77', label: '25' },
    { r: 60, pts: 15, color: '#FFD93D', label: '15' },
    { r: 90, pts: 10, color: '#4D96FF', label: '10' },
    { r: 120, pts: 5, color: '#C77DFF', label: '5' },
];

export default function Darts({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [turn, setTurn] = useState(0);
    const [round, setRound] = useState(0);
    const [dart, setDart] = useState(0);
    const [scores, setScores] = useState([0, 0]);
    const [aimX, setAimX] = useState(50);
    const [aimY, setAimY] = useState(50);
    const [step, setStep] = useState(0); // 0=x, 1=y, 2=result
    const [lastHit, setLastHit] = useState(null);
    const [hits, setHits] = useState([]);

    const reset = useCallback(() => {
        setTurn(0); setRound(0); setDart(0); setScores([0, 0]);
        setStep(0); setLastHit(null); setHits([]); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play' || step >= 2) return;
        const iv = setInterval(() => {
            const t = Date.now();
            if (step === 0) setAimX(50 + Math.sin(t * 0.004) * 45);
            else setAimY(50 + Math.sin(t * 0.005) * 45);
        }, 25);
        return () => clearInterval(iv);
    }, [phase, step]);

    const handleClick = () => {
        if (step === 0) { setStep(1); }
        else if (step === 1) {
            const cx = 130, cy = 130; // center of board
            const hitX = (aimX / 100) * 260;
            const hitY = (aimY / 100) * 260;
            const dist = Math.sqrt((hitX - cx) ** 2 + (hitY - cy) ** 2);
            let pts = 0;
            for (const ring of RINGS) { if (dist <= ring.r) { pts = ring.pts; break; } }
            const newS = [...scores]; newS[turn] += pts; setScores(newS);
            setLastHit(pts); setHits(h => [...h, { x: hitX, y: hitY, player: turn }]); setStep(2);
        }
    };

    const nextDart = () => {
        const nextD = dart + 1;
        if (nextD >= DARTS_PER_ROUND) {
            const nextP = 1 - turn;
            const nextR = nextP === 0 ? round + 1 : round;
            if (nextR >= ROUNDS) { setPhase('end'); onScoreUpdate?.(Math.max(scores[0], scores[1])); return; }
            setRound(nextR); setTurn(nextP); setDart(0);
        } else {
            setDart(nextD);
        }
        setStep(0); setLastHit(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Darts</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>{ROUNDS} rounds, {DARTS_PER_ROUND} darts each. Highest score wins!</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Orbitron', fontSize: '.85rem' }}>
                        <span style={{ color: '#FF6B6B' }}>P1: {scores[0]}</span>
                        <span style={{ color: '#B8C1EC' }}>R{round + 1} D{dart + 1}</span>
                        <span style={{ color: '#4D96FF' }}>P2: {scores[1]}</span>
                    </div>
                    <p style={{ color: turn === 0 ? '#FF6B6B' : '#4D96FF', fontFamily: 'Orbitron', fontSize: '.8rem', marginBottom: 8 }}>Player {turn + 1}</p>
                    {/* Board */}
                    <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 12px', background: '#1a1a2e', borderRadius: '50%', border: '4px solid #333' }}>
                        {RINGS.slice().reverse().map((ring, i) => (
                            <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: ring.r * 2, height: ring.r * 2, borderRadius: '50%', border: `2px solid ${ring.color}40`, background: `${ring.color}15`, transform: 'translate(-50%,-50%)' }} />
                        ))}
                        {hits.map((h, i) => (
                            <div key={i} style={{ position: 'absolute', left: h.x, top: h.y, width: 8, height: 8, borderRadius: '50%', background: h.player === 0 ? '#FF6B6B' : '#4D96FF', transform: 'translate(-50%,-50%)', border: '1px solid #fff' }} />
                        ))}
                        {/* Aim crosshair */}
                        {step < 2 && (
                            <>
                                <div style={{ position: 'absolute', left: `${aimX}%`, top: 0, width: 2, height: '100%', background: step === 0 ? '#FFD93Daa' : '#FFD93D44' }} />
                                <div style={{ position: 'absolute', top: `${aimY}%`, left: 0, width: '100%', height: 2, background: step === 1 ? '#FFD93Daa' : '#FFD93D44' }} />
                            </>
                        )}
                    </div>
                    {step < 2 && (
                        <button type="button" onClick={handleClick} className="btn btn-primary">
                            {step === 0 ? 'SET X AIM' : 'THROW! 🎯'}
                        </button>
                    )}
                    {step === 2 && (
                        <div>
                            <p style={{ fontSize: '1.2rem', fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>{lastHit > 0 ? `${lastHit} points!` : 'Miss!'}</p>
                            <button type="button" onClick={nextDart} className="btn btn-primary">NEXT</button>
                        </div>
                    )}
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {scores[0] >= scores[1] ? 'Player 1' : 'Player 2'} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{scores[0]} – {scores[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
