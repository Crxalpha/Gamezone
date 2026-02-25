import { useState, useEffect, useRef, useCallback } from 'react';

const W = 400, H = 300, PH = 60, PW = 10, BZ = 10, SPD = 4;

export default function PongDuel({ onScoreUpdate }) {
    const ref = useRef(null);
    const [state, setState] = useState('idle');
    const [s1, setS1] = useState(0);
    const [s2, setS2] = useState(0);
    const p1 = useRef(H / 2 - PH / 2); const p2 = useRef(H / 2 - PH / 2);
    const ball = useRef({ x: W / 2, y: H / 2, dx: 3, dy: 2 });
    const sc = useRef({ p1: 0, p2: 0 });
    const keys = useRef({});
    const gst = useRef('idle');
    const loop = useRef(null);

    const resetBall = () => { ball.current = { x: W / 2, y: H / 2, dx: (Math.random() > .5 ? 1 : -1) * 3, dy: (Math.random() - .5) * 4 }; };

    const draw = useCallback(() => {
        const c = ref.current; if (!c) return; const ctx = c.getContext('2d');
        ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);
        ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
        // Paddles
        ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 6;
        ctx.fillRect(10, p1.current, PW, PH);
        ctx.fillStyle = '#06d6a0'; ctx.shadowColor = '#06d6a0';
        ctx.fillRect(W - 20, p2.current, PW, PH);
        // Ball
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(ball.current.x, ball.current.y, BZ, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // Score
        ctx.font = '20px Orbitron, sans-serif'; ctx.fillStyle = '#a855f7'; ctx.fillText(sc.current.p1, W / 2 - 40, 30);
        ctx.fillStyle = '#06d6a0'; ctx.fillText(sc.current.p2, W / 2 + 25, 30);
    }, []);

    const tick = useCallback(() => {
        if (gst.current !== 'playing') return;
        const k = keys.current;
        if (k['w']) p1.current = Math.max(0, p1.current - SPD);
        if (k['s']) p1.current = Math.min(H - PH, p1.current + SPD);
        if (k['ArrowUp']) p2.current = Math.max(0, p2.current - SPD);
        if (k['ArrowDown']) p2.current = Math.min(H - PH, p2.current + SPD);

        const b = ball.current;
        b.x += b.dx; b.y += b.dy;
        if (b.y <= BZ || b.y >= H - BZ) b.dy *= -1;
        // P1 paddle
        if (b.x - BZ <= 20 && b.y >= p1.current && b.y <= p1.current + PH) { b.dx = Math.abs(b.dx) * 1.05; b.dy += (Math.random() - .5); }
        // P2 paddle
        if (b.x + BZ >= W - 20 && b.y >= p2.current && b.y <= p2.current + PH) { b.dx = -Math.abs(b.dx) * 1.05; b.dy += (Math.random() - .5); }
        // Score
        if (b.x < 0) { sc.current.p2++; setS2(sc.current.p2); resetBall(); checkWin(); }
        if (b.x > W) { sc.current.p1++; setS1(sc.current.p1); resetBall(); checkWin(); }

        draw();
        if (gst.current === 'playing') loop.current = requestAnimationFrame(tick);
    }, [draw]);

    const checkWin = () => {
        if (sc.current.p1 >= 5 || sc.current.p2 >= 5) {
            gst.current = 'over'; setState('over');
            const winner = sc.current.p1 >= 5 ? 1 : 2;
            onScoreUpdate?.(Math.max(sc.current.p1, sc.current.p2) * 100, winner);
        }
    };

    const start = () => {
        p1.current = H / 2 - PH / 2; p2.current = H / 2 - PH / 2;
        sc.current = { p1: 0, p2: 0 }; setS1(0); setS2(0);
        resetBall(); gst.current = 'playing'; setState('playing');
        loop.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        const kd = (e) => { keys.current[e.key] = true; if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) e.preventDefault(); };
        const ku = (e) => { keys.current[e.key] = false; };
        window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
        draw();
        return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); cancelAnimationFrame(loop.current); };
    }, [draw, tick]);

    return (
        <div className="mg">
            <div className="mg-scores">
                <span style={{ color: 'var(--purple)' }}>P1 (W/S): <strong>{s1}</strong></span>
                <span>First to 5</span>
                <span style={{ color: 'var(--cyan)' }}>P2 (↑/↓): <strong>{s2}</strong></span>
            </div>
            <canvas ref={ref} width={W} height={H} className="pong-canvas" />
            {state === 'over' && <div style={{ padding: '12px 20px', background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.3)', borderRadius: 'var(--r-md)', fontWeight: 700, color: 'var(--purple)' }}>🏆 {s1 >= 5 ? 'Player 1' : 'Player 2'} Wins!</div>}
            <div className="mg-actions">
                {state !== 'playing' && <button type="button" className="btn btn-primary" onClick={start}>{state === 'over' ? '🔄 Rematch' : '▶ Start'}</button>}
                {state === 'playing' && <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>P1: W/S | P2: ↑/↓</span>}
            </div>
        </div>
    );
}
