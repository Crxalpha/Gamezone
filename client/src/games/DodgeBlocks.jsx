import { useState, useEffect, useRef, useCallback } from 'react';

const W = 360, H = 480, PW = 50, PH = 16, BW = 30, BH = 14;

export default function DodgeBlocks({ onScoreUpdate }) {
    const ref = useRef(null);
    const [state, setState] = useState('idle');
    const [score, setScore] = useState(0);
    const [hi, setHi] = useState(0);
    const px = useRef(W / 2 - PW / 2);
    const blocks = useRef([]);
    const sc = useRef(0);
    const gst = useRef('idle');
    const loop = useRef(null);
    const spd = useRef(2);
    const frame = useRef(0);

    const draw = useCallback(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);

        // Player
        ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.roundRect(px.current, H - 40, PW, PH, 6); ctx.fill(); ctx.shadowBlur = 0;

        // Blocks
        blocks.current.forEach(b => {
            ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 4;
            ctx.beginPath(); ctx.roundRect(b.x, b.y, BW, BH, 4); ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Score
        ctx.fillStyle = '#fff'; ctx.font = '14px Orbitron, sans-serif'; ctx.fillText(`Score: ${sc.current}`, 10, 24);
    }, []);

    const tick = useCallback(() => {
        if (gst.current !== 'playing') return;
        frame.current++;

        // Spawn blocks
        if (frame.current % Math.max(15, 30 - Math.floor(sc.current / 10)) === 0) {
            const colors = ['#ef4444', '#f97316', '#fbbf24', '#3b82f6'];
            blocks.current.push({ x: Math.random() * (W - BW), y: -BH, color: colors[Math.floor(Math.random() * colors.length)] });
        }

        // Move blocks
        blocks.current.forEach(b => { b.y += spd.current + sc.current * 0.02; });

        // Remove offscreen & score
        const before = blocks.current.length;
        blocks.current = blocks.current.filter(b => b.y < H + 20);
        const removed = before - blocks.current.length;
        if (removed > 0) { sc.current += removed; setScore(sc.current); }

        // Collision
        const py = H - 40;
        for (const b of blocks.current) {
            if (b.y + BH > py && b.y < py + PH && b.x + BW > px.current && b.x < px.current + PW) {
                end(); return;
            }
        }

        draw();
    }, [draw]);

    const end = () => {
        gst.current = 'over'; setState('over'); cancelAnimationFrame(loop.current);
        if (sc.current > hi) setHi(sc.current);
        onScoreUpdate?.(sc.current, Math.floor(sc.current / 20) + 1);
        draw();
    };

    const start = () => {
        px.current = W / 2 - PW / 2; blocks.current = []; sc.current = 0; frame.current = 0; setScore(0);
        gst.current = 'playing'; setState('playing');
        const run = () => { tick(); if (gst.current === 'playing') loop.current = requestAnimationFrame(run); };
        run();
    };

    useEffect(() => {
        const h = (e) => {
            if (gst.current !== 'playing') return;
            if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); px.current = Math.max(0, px.current - 20); }
            if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); px.current = Math.min(W - PW, px.current + 20); }
        };
        window.addEventListener('keydown', h);
        draw();
        return () => { window.removeEventListener('keydown', h); cancelAnimationFrame(loop.current); };
    }, [draw, tick]);

    const mobMove = (dir) => {
        if (gst.current !== 'playing') return;
        if (dir === 'left') px.current = Math.max(0, px.current - 25);
        if (dir === 'right') px.current = Math.min(W - PW, px.current + 25);
    };

    return (
        <div className="mg">
            <div className="mg-scores">
                <span>Score: <strong style={{ color: 'var(--purple)' }}>{score}</strong></span>
                <span>Best: <strong style={{ color: 'var(--cyan)' }}>{hi}</strong></span>
            </div>
            <canvas ref={ref} width={W} height={H} className="dodge-canvas" />
            {state === 'over' && <div style={{ padding: '10px 20px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--r-md)', fontWeight: 700, color: 'var(--red)' }}>Game Over! Score: {score}</div>}
            <div className="mg-actions">
                {state !== 'playing' ? (
                    <button type="button" className="btn btn-primary" onClick={start}>{state === 'over' ? '🔄 Retry' : '▶ Start'}</button>
                ) : (
                    <>
                        <button type="button" className="btn btn-secondary" onClick={() => mobMove('left')} style={{ padding: '12px 24px' }}>⬅</button>
                        <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>← / → or tap</span>
                        <button type="button" className="btn btn-secondary" onClick={() => mobMove('right')} style={{ padding: '12px 24px' }}>➡</button>
                    </>
                )}
            </div>
        </div>
    );
}
