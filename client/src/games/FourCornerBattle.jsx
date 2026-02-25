import { useState, useRef, useEffect, useCallback } from 'react';

const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f97316'];
const NAMES = ['P1', 'P2', 'P3', 'P4'];
const ROUNDS = 10;

export default function FourCornerBattle({ onScoreUpdate }) {
    const [state, setState] = useState('idle');
    const [scores, setScores] = useState([0, 0, 0, 0]);
    const [target, setTarget] = useState(-1);
    const [round, setRound] = useState(0);
    const [msg, setMsg] = useState('');
    const [flash, setFlash] = useState(-1);
    const timerRef = useRef(null);
    const activeRef = useRef(false);

    const nextRound = useCallback(() => {
        if (round >= ROUNDS) {
            setState('over');
            const best = Math.max(...scores);
            const w = scores.indexOf(best);
            setMsg(`🏆 ${NAMES[w]} Wins with ${best} pts!`);
            onScoreUpdate?.(best, 1);
            return;
        }
        setTarget(-1); setFlash(-1); setMsg('Get ready...');
        activeRef.current = false;
        timerRef.current = setTimeout(() => {
            const t = Math.floor(Math.random() * 4);
            setTarget(t); setFlash(t); setMsg(`TAP ${NAMES[t]}!`);
            activeRef.current = true;
            // Timeout if nobody taps
            timerRef.current = setTimeout(() => {
                if (activeRef.current) {
                    activeRef.current = false;
                    setMsg('Too slow!');
                    setRound(r => r + 1);
                    setTimeout(() => nextRound(), 1000);
                }
            }, 2000);
        }, 1500 + Math.random() * 2000);
    }, [round, scores, onScoreUpdate]);

    const start = () => {
        setScores([0, 0, 0, 0]); setRound(0); setMsg(''); setState('playing');
        setTimeout(() => nextRound(), 500);
    };

    useEffect(() => {
        if (state === 'playing' && round > 0) nextRound();
    }, [round]);

    const tapCorner = (i) => {
        if (state !== 'playing' || !activeRef.current) return;
        activeRef.current = false;
        clearTimeout(timerRef.current);
        if (i === target) {
            const ns = [...scores]; ns[i] += 10; setScores(ns);
            setMsg(`✅ ${NAMES[i]} scores!`);
        } else {
            setMsg(`❌ Wrong! It was ${NAMES[target]}`);
        }
        setTimeout(() => setRound(r => r + 1), 1000);
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <div className="mg">
            <div className="mg-status">{state === 'idle' ? '🎯 4 Corner Battle' : msg}</div>
            <div className="mg-scores">
                {NAMES.map((n, i) => <span key={i} style={{ color: COLORS[i] }}>{n}: <strong>{scores[i]}</strong></span>)}
            </div>
            {state !== 'idle' && <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, ROUNDS)} / {ROUNDS}</div>}

            <div className="corner-grid">
                {COLORS.map((c, i) => (
                    <button type="button" key={i} className={`corner-btn ${flash === i ? 'flash' : ''}`}
                        style={{ background: flash === i ? c : `${c}33`, borderColor: flash === i ? c : 'transparent' }}
                        onClick={() => tapCorner(i)}>
                        {NAMES[i]}
                    </button>
                ))}
            </div>

            {(state === 'idle' || state === 'over') && (
                <button type="button" className="btn btn-primary" onClick={start}>{state === 'over' ? '🔄 Play Again' : '▶ Start'}</button>
            )}
        </div>
    );
}
