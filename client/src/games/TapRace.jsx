import { useState, useRef, useEffect } from 'react';

const GOAL = 100;

export default function TapRace({ onScoreUpdate }) {
    const [state, setState] = useState('idle');
    const [p1, setP1] = useState(0);
    const [p2, setP2] = useState(0);
    const [winner, setWinner] = useState(null);
    const p1Ref = useRef(0);
    const p2Ref = useRef(0);

    const start = () => { p1Ref.current = 0; p2Ref.current = 0; setP1(0); setP2(0); setWinner(null); setState('playing'); };

    const tap = (player) => {
        if (state !== 'playing' || winner) return;
        if (player === 1) { p1Ref.current++; setP1(p1Ref.current); if (p1Ref.current >= GOAL) { setWinner(1); setState('over'); onScoreUpdate?.(GOAL * 10, 1); } }
        else { p2Ref.current++; setP2(p2Ref.current); if (p2Ref.current >= GOAL) { setWinner(2); setState('over'); onScoreUpdate?.(GOAL * 10, 2); } }
    };

    // Keyboard support
    useEffect(() => {
        const h = (e) => {
            if (state !== 'playing') return;
            if (e.key === 'a' || e.key === 'A') tap(1);
            if (e.key === 'l' || e.key === 'L') tap(2);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    });

    return (
        <div className="mg">
            <div className="mg-status">
                {state === 'idle' && '🏁 Ready to Race?'}
                {state === 'playing' && `First to ${GOAL} taps!`}
                {winner && `🏆 Player ${winner} Wins!`}
            </div>

            <div className="tap-track">
                <div className="tap-lane">
                    <div className="tap-runner" style={{ height: `${(p1 / GOAL) * 100}%`, background: 'var(--grad2)', borderRadius: 'var(--r-md)' }}>
                        <span>P1: {p1}</span>
                    </div>
                </div>
                <div className="tap-lane">
                    <div className="tap-runner" style={{ height: `${(p2 / GOAL) * 100}%`, background: 'var(--grad3)', borderRadius: 'var(--r-md)' }}>
                        <span>P2: {p2}</span>
                    </div>
                </div>
            </div>

            {state === 'playing' ? (
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <button type="button" className="tap-btn" style={{ background: 'var(--grad2)', flex: 1 }} onClick={() => tap(1)}>P1 TAP! (A)</button>
                    <button type="button" className="tap-btn" style={{ background: 'var(--grad3)', flex: 1 }} onClick={() => tap(2)}>P2 TAP! (L)</button>
                </div>
            ) : (
                <button type="button" className="btn btn-primary" onClick={start}>{winner ? '🔄 Rematch' : '▶ Start Race'}</button>
            )}
        </div>
    );
}
