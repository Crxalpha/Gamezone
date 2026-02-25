import { useState, useRef, useCallback } from 'react';

export default function ReactionTime({ onScoreUpdate }) {
    const [phase, setPhase] = useState('idle'); // idle, wait, go, result, early
    const [times, setTimes] = useState([]);
    const [lastTime, setLastTime] = useState(0);
    const startRef = useRef(0);
    const timerRef = useRef(null);

    const startRound = () => {
        setPhase('wait');
        const delay = 2000 + Math.random() * 4000;
        timerRef.current = setTimeout(() => {
            startRef.current = Date.now();
            setPhase('go');
        }, delay);
    };

    const handleClick = useCallback(() => {
        if (phase === 'idle' || phase === 'result' || phase === 'early') {
            startRound();
        } else if (phase === 'wait') {
            clearTimeout(timerRef.current);
            setPhase('early');
        } else if (phase === 'go') {
            const rt = Date.now() - startRef.current;
            setLastTime(rt);
            const newTimes = [...times, rt];
            setTimes(newTimes);
            setPhase('result');
            const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
            const score = Math.max(1000 - avg, 0);
            onScoreUpdate?.(score, newTimes.length);
        }
    }, [phase, times, onScoreUpdate]);

    const bg = phase === 'wait' ? '#ef4444' : phase === 'go' ? '#10b981' : phase === 'early' ? '#f97316' : 'var(--bg-glass)';
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const best = times.length > 0 ? Math.min(...times) : 0;

    return (
        <div className="mg">
            <div className="mg-scores">
                <span>Attempts: <strong>{times.length}</strong></span>
                <span>Average: <strong style={{ color: 'var(--cyan)' }}>{avg}ms</strong></span>
                <span>Best: <strong style={{ color: 'var(--purple)' }}>{best}ms</strong></span>
            </div>
            <div className="react-zone" style={{ background: bg, color: '#fff', border: '2px solid var(--border)' }} onClick={handleClick}>
                {phase === 'idle' && '🎯 Tap to Start'}
                {phase === 'wait' && '⏳ Wait for green...'}
                {phase === 'go' && '🟢 TAP NOW!'}
                {phase === 'result' && `⚡ ${lastTime}ms — Tap to retry`}
                {phase === 'early' && '❌ Too early! Tap to retry'}
            </div>
            {times.length > 0 && (
                <button type="button" className="btn btn-secondary" onClick={() => { setTimes([]); setPhase('idle'); }}>🔄 Reset</button>
            )}
        </div>
    );
}
