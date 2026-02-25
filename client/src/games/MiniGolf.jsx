import { useRef, useEffect, useState, useCallback } from 'react';

const W = 500, H = 500, BALL_R = 8, HOLE_R = 14, FRICTION = 0.975, HOLES = 3;
const LAYOUTS = [
    { ball: { x: 100, y: 400 }, hole: { x: 400, y: 100 }, walls: [[200, 200, 200, 10]] },
    { ball: { x: 80, y: 250 }, hole: { x: 420, y: 250 }, walls: [[250, 100, 10, 200], [250, 350, 10, 80]] },
    { ball: { x: 250, y: 450 }, hole: { x: 250, y: 60 }, walls: [[100, 180, 150, 10], [250, 300, 150, 10]] },
];

export default function MiniGolf({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [info, setInfo] = useState({ strokes: [0, 0], turn: 0, holeNum: 0 });
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => {
        const l = LAYOUTS[0];
        stateRef.current = {
            bx: l.ball.x, by: l.ball.y, bvx: 0, bvy: 0, dragging: false,
            sx: 0, sy: 0, dx: 0, dy: 0, strokes: [0, 0], turn: 0, hole: 0, moving: false
        };
        setInfo({ strokes: [0, 0], turn: 0, holeNum: 0 }); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = () => canvas.getBoundingClientRect();
        const layout = LAYOUTS[s.hole];

        const onMD = (e) => {
            if (s.moving) return;
            const r = rect(); const mx = (e.clientX - r.left) * (W / r.width); const my = (e.clientY - r.top) * (H / r.height);
            const d = Math.sqrt((mx - s.bx) ** 2 + (my - s.by) ** 2);
            if (d < 25) { s.dragging = true; s.sx = mx; s.sy = my; s.dx = mx; s.dy = my; }
        };
        const onMM = (e) => { if (!s.dragging) return; const r = rect(); s.dx = (e.clientX - r.left) * (W / r.width); s.dy = (e.clientY - r.top) * (H / r.height); };
        const onMU = () => {
            if (!s.dragging) return; s.dragging = false;
            const power = Math.min(10, Math.sqrt((s.sx - s.dx) ** 2 + (s.sy - s.dy) ** 2) * 0.06);
            const angle = Math.atan2(s.sy - s.dy, s.sx - s.dx);
            s.bvx = Math.cos(angle) * power; s.bvy = Math.sin(angle) * power; s.moving = true;
            s.strokes[s.turn]++;
        };
        canvas.addEventListener('mousedown', onMD); canvas.addEventListener('mousemove', onMM); canvas.addEventListener('mouseup', onMU);

        const loop = () => {
            if (s.moving) {
                s.bx += s.bvx; s.by += s.bvy; s.bvx *= FRICTION; s.bvy *= FRICTION;
                if (s.bx - BALL_R < 0 || s.bx + BALL_R > W) s.bvx *= -1;
                if (s.by - BALL_R < 0 || s.by + BALL_R > H) s.bvy *= -1;
                s.bx = Math.max(BALL_R, Math.min(W - BALL_R, s.bx)); s.by = Math.max(BALL_R, Math.min(H - BALL_R, s.by));

                layout.walls.forEach(([wx, wy, ww, wh]) => {
                    if (s.bx + BALL_R > wx && s.bx - BALL_R < wx + ww && s.by + BALL_R > wy && s.by - BALL_R < wy + wh) {
                        const overlapL = (s.bx + BALL_R) - wx; const overlapR = (wx + ww) - (s.bx - BALL_R);
                        const overlapT = (s.by + BALL_R) - wy; const overlapB = (wy + wh) - (s.by - BALL_R);
                        const minO = Math.min(overlapL, overlapR, overlapT, overlapB);
                        if (minO === overlapL || minO === overlapR) s.bvx *= -1; else s.bvy *= -1;
                    }
                });

                if (Math.abs(s.bvx) < 0.1 && Math.abs(s.bvy) < 0.1) {
                    s.bvx = 0; s.bvy = 0; s.moving = false;
                    const d = Math.sqrt((s.bx - layout.hole.x) ** 2 + (s.by - layout.hole.y) ** 2);
                    if (d < HOLE_R) {
                        const nextHole = s.hole + 1;
                        if (s.turn === 1 && nextHole >= HOLES) {
                            setWinner(s.strokes[0] <= s.strokes[1] ? 'Player 1' : 'Player 2'); setPhase('end');
                            onScoreUpdate?.(Math.max(s.strokes[0], s.strokes[1]));
                            return;
                        }
                        if (s.turn === 1) { s.hole = nextHole; } else { s.turn = 1; }
                        const nl = LAYOUTS[s.hole % LAYOUTS.length];
                        s.bx = nl.ball.x; s.by = nl.ball.y;
                        if (s.turn === 1) s.turn = 1; else s.turn = 0;
                    } else {
                        s.turn = 1 - s.turn;
                    }
                }
            }
            setInfo({ strokes: [...s.strokes], turn: s.turn, holeNum: s.hole });

            // Draw
            ctx.fillStyle = '#1a6e32'; ctx.fillRect(0, 0, W, H);
            layout.walls.forEach(([wx, wy, ww, wh]) => { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(wx, wy, ww, wh); });
            ctx.beginPath(); ctx.arc(layout.hole.x, layout.hole.y, HOLE_R, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
            ctx.beginPath(); ctx.arc(layout.hole.x, layout.hole.y, HOLE_R + 2, 0, Math.PI * 2); ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2); ctx.fillStyle = s.turn === 0 ? '#FF6B6B' : '#4D96FF'; ctx.fill();
            if (s.dragging) {
                ctx.beginPath(); ctx.moveTo(s.bx, s.by); ctx.lineTo(s.bx + (s.sx - s.dx) * 0.4, s.by + (s.sy - s.dy) * 0.4);
                ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 3; ctx.stroke();
            }
            ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron'; ctx.textAlign = 'left';
            ctx.fillText(`Hole ${s.hole + 1}/${HOLES}`, 10, 26);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); canvas.removeEventListener('mousedown', onMD); canvas.removeEventListener('mousemove', onMM); canvas.removeEventListener('mouseup', onMU); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛳</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Mini Golf</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>{HOLES} holes, fewest total strokes wins!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>Drag from ball to aim & set power</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ display: 'flex', gap: 20, fontFamily: 'Orbitron', fontSize: '.8rem' }}>
                    <span style={{ color: '#FF6B6B' }}>P1: {info.strokes[0]} strokes</span>
                    <span style={{ color: info.turn === 0 ? '#FF6B6B' : '#4D96FF' }}>Player {info.turn + 1}'s turn</span>
                    <span style={{ color: '#4D96FF' }}>P2: {info.strokes[1]} strokes</span>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%', cursor: 'crosshair' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {winner} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{info.strokes[0]} vs {info.strokes[1]} total strokes</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
