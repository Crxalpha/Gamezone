import { useState, useCallback } from 'react';

const COLORS = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D'];
const KEYS = ['q', 'p', 'z', 'm']; // P1: Q, P2: P, P3: Z, P4: M
const ROUNDS = 5;

export default function ReactionTap({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [playerCount, setPlayerCount] = useState(2);
    const [round, setRound] = useState(0);
    const [scores, setScores] = useState([0, 0, 0, 0]);
    const [state, setState] = useState('waiting'); // waiting | ready | go | result
    const [resultMsg, setResultMsg] = useState('');
    const [goTime, setGoTime] = useState(0);

    const reset = useCallback(() => {
        setRound(0); setScores([0, 0, 0, 0]); setState('waiting'); setResultMsg(''); setPhase('play');
        startRound();
    }, []);

    const startRound = () => {
        setState('ready');
        const delay = 1500 + Math.random() * 3000;
        setTimeout(() => {
            setState('go');
            setGoTime(Date.now());
            // Timeout if no one taps
            setTimeout(() => setState(prev => prev === 'go' ? 'timeout' : prev), 3000);
        }, delay);
    };

    const handleTap = (player) => {
        if (state === 'ready') {
            setResultMsg(`Player ${player + 1} tapped too early! ❌`);
            setState('result');
            setTimeout(() => nextRound(), 1500);
            return;
        }
        if (state !== 'go') return;
        const reaction = Date.now() - goTime;
        const newS = [...scores]; newS[player] += 1; setScores(newS);
        setResultMsg(`Player ${player + 1} wins! (${reaction}ms) ⚡`);
        setState('result');
        setTimeout(() => nextRound(), 1500);
    };

    const nextRound = () => {
        const nr = round + 1;
        if (nr >= ROUNDS) { setPhase('end'); onScoreUpdate?.(Math.max(...scores)); return; }
        setRound(nr); setResultMsg(''); startRound();
    };

    const keyLabels = ['Q', 'P', 'Z', 'M'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Reaction Tap</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>Tap your key when the screen turns GREEN! Fastest wins.</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                        {[1, 2, 3, 4].map(n => (
                            <button type="button" key={n} onClick={() => setPlayerCount(n)} style={{
                                padding: '8px 16px', borderRadius: 12, fontFamily: 'Orbitron', fontSize: '.8rem',
                                background: playerCount === n ? '#C77DFF' : '#1B1E3F', color: '#fff', border: `2px solid ${playerCount === n ? '#C77DFF' : '#333'}`,
                                cursor: 'pointer'
                            }}>{n}P</button>
                        ))}
                    </div>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12, fontFamily: 'Orbitron', fontSize: '.8rem' }}>
                        {Array.from({ length: playerCount }).map((_, i) => (
                            <span key={i} style={{ color: COLORS[i] }}>P{i + 1}: {scores[i]}</span>
                        ))}
                    </div>
                    <p style={{ color: '#B8C1EC', fontFamily: 'Orbitron', fontSize: '.8rem', marginBottom: 12 }}>Round {round + 1}/{ROUNDS}</p>
                    <div onClick={() => state === 'go' && handleTap(0)} style={{
                        width: '100%', height: 200, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontFamily: 'Orbitron', cursor: 'pointer', transition: 'all .3s',
                        background: state === 'go' ? '#6BCB77' : state === 'ready' ? '#FF6B6B' : state === 'result' ? '#1B1E3F' : '#1B1E3F',
                        color: '#fff', border: '3px solid #333'
                    }}>
                        {state === 'waiting' && 'Get Ready...'}
                        {state === 'ready' && 'WAIT... 🔴'}
                        {state === 'go' && 'TAP NOW! 🟢'}
                        {state === 'result' && resultMsg}
                        {state === 'timeout' && 'Too slow! ⏱'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                        {Array.from({ length: playerCount }).map((_, i) => (
                            <button type="button" key={i} onClick={() => handleTap(i)} style={{
                                padding: '16px 28px', borderRadius: 16, fontSize: '1.2rem', fontFamily: 'Orbitron',
                                background: COLORS[i], color: '#fff', border: 'none', cursor: 'pointer',
                                opacity: state === 'go' || state === 'ready' ? 1 : 0.5
                            }}>
                                {keyLabels[i]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>🏆 Results!</h3>
                    {Array.from({ length: playerCount }).map((_, i) => (
                        <p key={i} style={{ color: COLORS[i], fontFamily: 'Orbitron', fontSize: '.9rem' }}>Player {i + 1}: {scores[i]} wins</p>
                    ))}
                    <button type="button" onClick={() => setPhase('menu')} className="btn btn-primary" style={{ marginTop: 12 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
