import { useState, useCallback } from 'react';

const ROUNDS = 5;

export default function ArcheryDuel({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState(0);
    const [scores, setScores] = useState([0, 0]);
    const [step, setStep] = useState(0); // 0=angle, 1=power, 2=result
    const [angle, setAngle] = useState(50);
    const [power, setPower] = useState(50);
    const [wind, setWind] = useState(0);
    const [result, setResult] = useState(null);
    const [moving, setMoving] = useState(true);

    const reset = useCallback(() => {
        setRound(0); setTurn(0); setScores([0, 0]); setStep(0); setResult(null);
        setAngle(50); setPower(50); setWind(Math.floor(Math.random() * 20) - 10);
        setMoving(true); setPhase('play');
    }, []);

    const nextTurn = () => {
        const nextP = 1 - turn;
        const nextR = nextP === 0 ? round + 1 : round;
        if (nextR >= ROUNDS) {
            setPhase('end'); onScoreUpdate?.(Math.max(scores[0], scores[1])); return;
        }
        setRound(nextR); setTurn(nextP); setStep(0); setResult(null);
        setAngle(50); setPower(50); setWind(Math.floor(Math.random() * 20) - 10); setMoving(true);
    };

    const shoot = () => {
        const drift = wind * 2;
        const accuracy = Math.abs(50 - angle + drift) + Math.abs(50 - power) * 0.5;
        let points = 0;
        if (accuracy < 8) points = 10;
        else if (accuracy < 16) points = 8;
        else if (accuracy < 25) points = 6;
        else if (accuracy < 35) points = 4;
        else if (accuracy < 50) points = 2;
        else points = 0;
        const newS = [...scores]; newS[turn] += points; setScores(newS);
        setResult(points); setStep(2);
    };

    // Animate sliders
    const handleClick = () => {
        if (step === 0) { setMoving(false); setStep(1); setMoving(true); }
        else if (step === 1) { setMoving(false); shoot(); }
    };

    // Simple oscillating value for the slider
    const [tick, setTick] = useState(0);
    useState(() => {
        const iv = setInterval(() => setTick(t => t + 1), 30);
        return () => clearInterval(iv);
    });

    const oscillate = (t) => 50 + Math.sin(t * 0.08) * 45;

    if (moving && phase === 'play') {
        if (step === 0) {
            const newA = oscillate(tick);
            if (angle !== Math.round(newA)) setTimeout(() => setAngle(Math.round(newA)), 0);
        } else if (step === 1) {
            const newP = oscillate(tick + 50);
            if (power !== Math.round(newP)) setTimeout(() => setPower(Math.round(newP)), 0);
        }
    }

    const ringColor = (pts) => pts >= 8 ? '#FFD93D' : pts >= 4 ? '#6BCB77' : '#FF6B6B';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏹</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Archery Duel</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>{ROUNDS} rounds. Stop the sliders at the right time!</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#FF6B6B' }}>P1: {scores[0]}</span>
                        <span style={{ color: '#B8C1EC' }}>Round {round + 1}/{ROUNDS}</span>
                        <span style={{ color: '#4D96FF' }}>P2: {scores[1]}</span>
                    </div>
                    <p style={{ color: '#FFD93D', fontFamily: 'Orbitron', fontSize: '.85rem', marginBottom: 8 }}>
                        Player {turn + 1} • Wind: {wind > 0 ? `→${wind}` : wind < 0 ? `←${Math.abs(wind)}` : 'none'}
                    </p>
                    {/* Target */}
                    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 20px' }}>
                        {[100, 80, 60, 40, 20].map((size, i) => (
                            <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: size, height: size, borderRadius: '50%', border: `3px solid ${i % 2 === 0 ? '#FF6B6B' : '#fff'}`, background: i === 4 ? '#FFD93D' : 'transparent' }} />
                        ))}
                        {step === 2 && <div style={{ position: 'absolute', left: `${angle}%`, top: `${power}%`, width: 16, height: 16, borderRadius: '50%', background: '#00E5FF', border: '2px solid #fff', transform: 'translate(-50%,-50%)', boxShadow: '0 0 12px #00E5FF' }} />}
                    </div>
                    {/* Sliders */}
                    {step < 2 && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ color: '#B8C1EC', fontSize: '.8rem', marginBottom: 8 }}>{step === 0 ? 'Click to set ANGLE' : 'Click to set POWER'}</p>
                            <div style={{ height: 24, background: '#1B1E3F', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: `${step === 0 ? angle : power}%`, top: 0, width: 4, height: '100%', background: '#FFD93D', transform: 'translateX(-50%)', transition: moving ? 'none' : 'left .1s' }} />
                            </div>
                            <button type="button" onClick={handleClick} className="btn btn-primary" style={{ marginTop: 16 }}>
                                {step === 0 ? 'SET ANGLE' : 'SHOOT! 🏹'}
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <p style={{ fontSize: '1.5rem', color: ringColor(result), fontFamily: 'Orbitron' }}>{result} points!</p>
                            <button type="button" onClick={nextTurn} className="btn btn-primary" style={{ marginTop: 12 }}>NEXT</button>
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
