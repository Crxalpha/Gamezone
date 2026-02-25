import { useState, useEffect, useRef, useCallback } from 'react';

const CELL = 20, W = 400, H = 400, COLS = W / CELL, ROWS = H / CELL;
const DIRS = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } };

function rFood(snake) { let p; do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; } while (snake.some(s => s.x === p.x && s.y === p.y)); return p; }

export default function SnakeGame({ onScoreUpdate }) {
    const ref = useRef(null);
    const [state, setState] = useState('idle');
    const [score, setScore] = useState(0);
    const [hi, setHi] = useState(0);
    const sn = useRef([{ x: 10, y: 10 }]); const dir = useRef({ x: 1, y: 0 }); const food = useRef(rFood([{ x: 10, y: 10 }])); const sc = useRef(0); const gst = useRef('idle'); const loop = useRef(null);

    const draw = useCallback(() => {
        const c = ref.current; if (!c) return; const ctx = c.getContext('2d');
        ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.02)'; ctx.lineWidth = .5;
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
        const f = food.current;
        ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        sn.current.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#a855f7' : `rgba(168,85,247,${1 - i / sn.current.length * .5})`; ctx.shadowColor = i === 0 ? '#a855f7' : 'transparent'; ctx.shadowBlur = i === 0 ? 8 : 0; ctx.beginPath(); ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 4); ctx.fill(); });
        ctx.shadowBlur = 0;
    }, []);

    const tick = useCallback(() => {
        if (gst.current !== 'playing') return;
        const s = sn.current; const d = dir.current;
        const h = { x: s[0].x + d.x, y: s[0].y + d.y };
        if (h.x < 0 || h.x >= COLS || h.y < 0 || h.y >= ROWS || s.some(p => p.x === h.x && p.y === h.y)) { end(); return; }
        const ns = [h, ...s];
        if (h.x === food.current.x && h.y === food.current.y) { sc.current += 10; setScore(sc.current); food.current = rFood(ns); } else ns.pop();
        sn.current = ns; draw();
    }, [draw]);

    const end = () => { gst.current = 'over'; setState('over'); clearInterval(loop.current); if (sc.current > hi) setHi(sc.current); onScoreUpdate?.(sc.current, Math.floor(sc.current / 50) + 1); draw(); };

    const start = () => {
        sn.current = [{ x: 10, y: 10 }]; dir.current = { x: 1, y: 0 }; food.current = rFood([{ x: 10, y: 10 }]); sc.current = 0; setScore(0);
        gst.current = 'playing'; setState('playing'); clearInterval(loop.current); loop.current = setInterval(tick, 120); draw();
    };

    useEffect(() => {
        const h = (e) => { const d = DIRS[e.key]; if (d && gst.current === 'playing') { e.preventDefault(); const c = dir.current; if (d.x !== -c.x || d.y !== -c.y) dir.current = d; } };
        window.addEventListener('keydown', h); draw();
        return () => { window.removeEventListener('keydown', h); clearInterval(loop.current); };
    }, [draw, tick]);

    const mob = (k) => { const d = DIRS[k]; if (d && gst.current === 'playing') { const c = dir.current; if (d.x !== -c.x || d.y !== -c.y) dir.current = d; } };

    return (
        <div className="mg">
            <div className="mg-scores"><span>Score: <strong style={{ color: 'var(--purple)' }}>{score}</strong></span><span>Best: <strong style={{ color: 'var(--cyan)' }}>{hi}</strong></span></div>
            <canvas ref={ref} width={W} height={H} className="snake-canvas" />
            {state === 'over' && <div style={{ padding: '10px 20px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--r-md)', fontWeight: 700, color: 'var(--red)' }}>Game Over! Score: {score}</div>}
            <div className="mg-actions">
                {state !== 'playing' ? <button type="button" className="btn btn-primary" onClick={start}>{state === 'over' ? '🔄 Play Again' : '▶ Start'}</button> : <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Arrow Keys / WASD</span>}
            </div>
            <div className="snake-mobile">
                <button type="button" className="u" onClick={() => mob('ArrowUp')}>↑</button>
                <button type="button" className="l" onClick={() => mob('ArrowLeft')}>←</button>
                <button type="button" className="r" onClick={() => mob('ArrowRight')}>→</button>
                <button type="button" className="d" onClick={() => mob('ArrowDown')}>↓</button>
            </div>
        </div>
    );
}
