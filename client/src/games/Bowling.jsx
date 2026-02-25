import { useState, useEffect, useCallback } from 'react';

const FRAMES = 10, PINS_LAYOUT = [[250, 100], [220, 130], [280, 130], [190, 160], [250, 160], [310, 160], [160, 190], [220, 190], [280, 190], [340, 190]];

export default function Bowling({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [turn, setTurn] = useState(0);
    const [frame, setFrame] = useState(0);
    const [scores, setScores] = useState([0, 0]);
    const [step, setStep] = useState(0); // 0=position, 1=power
    const [pos, setPos] = useState(50);
    const [power, setPower] = useState(50);
    const [pins, setPins] = useState(PINS_LAYOUT.map(() => true));
    const [result, setResult] = useState(null);
    const [moving, setMoving] = useState(true);

    const reset = useCallback(() => {
        setFrame(0); setTurn(0); setScores([0, 0]); setStep(0); setResult(null);
        setPins(PINS_LAYOUT.map(() => true)); setMoving(true); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play' || !moving) return;
        const iv = setInterval(() => {
            if (step === 0) setPos(p => { const v = 50 + Math.sin(Date.now() * 0.004) * 45; return Math.round(v); });
            if (step === 1) setPower(p => { const v = 50 + Math.sin(Date.now() * 0.005) * 45; return Math.round(v); });
        }, 30);
        return () => clearInterval(iv);
    }, [phase, step, moving]);

    const handleClick = () => {
        if (result) return;
        if (step === 0) { setMoving(false); setStep(1); setTimeout(() => setMoving(true), 50); }
        else if (step === 1) {
            setMoving(false);
            // Calculate pins knocked
            const accuracy = Math.abs(50 - pos);
            const force = power;
            const hitChance = (force / 100) * (1 - accuracy / 100);
            const newPins = pins.map((standing) => standing ? Math.random() < hitChance * 0.85 + 0.1 ? false : true : false);
            const knocked = pins.filter((p, i) => p && !newPins[i]).length;
            setPins(newPins);
            const newS = [...scores]; newS[turn] += knocked; setScores(newS);
            setResult(`${knocked} pins!`);
        }
    };

    const nextTurn = () => {
        const nextP = 1 - turn; const nextF = nextP === 0 ? frame + 1 : frame;
        if (nextF >= FRAMES) { setPhase('end'); onScoreUpdate?.(Math.max(scores[0], scores[1])); return; }
        setFrame(nextF); setTurn(nextP); setStep(0); setResult(null);
        setPins(PINS_LAYOUT.map(() => true)); setMoving(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎳</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Bowling</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>{FRAMES} frames! Knock down all the pins.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#FF6B6B' }}>P1: {scores[0]}</span>
                        <span style={{ color: '#B8C1EC' }}>Frame {frame + 1}/{FRAMES}</span>
                        <span style={{ color: '#4D96FF' }}>P2: {scores[1]}</span>
                    </div>
                    <p style={{ color: turn === 0 ? '#FF6B6B' : '#4D96FF', fontFamily: 'Orbitron', fontSize: '.85rem', marginBottom: 12 }}>Player {turn + 1}</p>
                    {/* Lane */}
                    <div style={{ position: 'relative', width: 300, height: 280, margin: '0 auto 16px', background: 'linear-gradient(180deg, #deb887, #d2a066)', borderRadius: 8, overflow: 'hidden' }}>
                        {PINS_LAYOUT.map(([px, py], i) => (
                            <div key={i} style={{ position: 'absolute', left: px - 150 + 150, top: py, width: 16, height: 16, borderRadius: '50%', background: pins[i] ? '#fff' : '#666', border: `2px solid ${pins[i] ? '#333' : '#555'}`, transform: 'translate(-50%,-50%)', transition: 'all .3s' }} />
                        ))}
                        {/* Ball position indicator */}
                        <div style={{ position: 'absolute', bottom: 10, left: `${pos}%`, width: 24, height: 24, borderRadius: '50%', background: '#333', border: '3px solid #555', transform: 'translateX(-50%)' }} />
                    </div>
                    {!result && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ color: '#B8C1EC', fontSize: '.8rem', marginBottom: 8 }}>{step === 0 ? 'Click to set POSITION' : 'Click to set POWER'}</p>
                            <div style={{ height: 20, background: '#1B1E3F', borderRadius: 10, position: 'relative', margin: '0 auto', maxWidth: 300 }}>
                                <div style={{ position: 'absolute', left: `${step === 0 ? pos : power}%`, top: 0, width: 4, height: '100%', background: '#FFD93D', transform: 'translateX(-50%)' }} />
                            </div>
                            <button type="button" onClick={handleClick} className="btn btn-primary" style={{ marginTop: 12 }}>
                                {step === 0 ? 'SET POSITION' : 'BOWL! 🎳'}
                            </button>
                        </div>
                    )}
                    {result && (
                        <div>
                            <p style={{ fontSize: '1.3rem', fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>{result}</p>
                            <button type="button" onClick={nextTurn} className="btn btn-primary">NEXT</button>
                        </div>
                    )}
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {scores[0] >= scores[1] ? 'Player 1' : 'Player 2'} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{scores[0]} – {scores[1]} pins</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
