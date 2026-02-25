import { useRef, useEffect, useState, useCallback } from 'react';

const W = 600, H = 400, BR = 10, POCKET_R = 18, FRICTION = 0.985;
const POCKETS = [[0, 0], [W / 2, 0], [W, 0], [0, H], [W / 2, H], [W, H]];

function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function Pool({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [turn, setTurn] = useState(0);
    const [winner, setWinner] = useState(null);

    const initBalls = () => {
        const balls = [{ x: 180, y: H / 2, vx: 0, vy: 0, color: '#fff', sunk: false }];
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF', '#FF9F1C', '#ef4444', '#06d6a0', '#f72585'];
        let idx = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col <= row; col++) {
                balls.push({ x: 380 + row * (BR * 2 + 2), y: H / 2 + (col - row / 2) * (BR * 2 + 2), vx: 0, vy: 0, color: colors[idx % colors.length], sunk: false });
                idx++;
            }
        }
        return balls;
    };

    const reset = useCallback(() => {
        stateRef.current = { balls: initBalls(), s: [0, 0], turn: 0, dragging: false, dx: 0, dy: 0 };
        setScores([0, 0]); setTurn(0); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = () => canvas.getBoundingClientRect();

        const onMD = (e) => {
            const r = rect(); const mx = (e.clientX - r.left) * (W / r.width); const my = (e.clientY - r.top) * (H / r.height);
            const cue = s.balls[0]; if (cue.sunk) return;
            if (dist({ x: mx, y: my }, cue) < 20) { s.dragging = true; s.sx = mx; s.sy = my; }
        };
        const onMM = (e) => {
            if (!s.dragging) return;
            const r = rect(); s.dx = (e.clientX - r.left) * (W / r.width); s.dy = (e.clientY - r.top) * (H / r.height);
        };
        const onMU = () => {
            if (!s.dragging) return;
            s.dragging = false;
            const cue = s.balls[0];
            const power = Math.min(12, dist({ x: s.sx, y: s.sy }, { x: s.dx, y: s.dy }) * 0.08);
            const angle = Math.atan2(s.sy - s.dy, s.sx - s.dx);
            cue.vx = Math.cos(angle) * power; cue.vy = Math.sin(angle) * power;
        };
        canvas.addEventListener('mousedown', onMD); canvas.addEventListener('mousemove', onMM); canvas.addEventListener('mouseup', onMU);

        const loop = () => {
            let moving = false;
            s.balls.forEach(b => {
                if (b.sunk) return;
                b.x += b.vx; b.y += b.vy; b.vx *= FRICTION; b.vy *= FRICTION;
                if (Math.abs(b.vx) < 0.05 && Math.abs(b.vy) < 0.05) { b.vx = 0; b.vy = 0; } else moving = true;
                if (b.x - BR < 0 || b.x + BR > W) { b.vx *= -1; b.x = Math.max(BR, Math.min(W - BR, b.x)); }
                if (b.y - BR < 0 || b.y + BR > H) { b.vy *= -1; b.y = Math.max(BR, Math.min(H - BR, b.y)); }
                POCKETS.forEach(([px, py]) => {
                    if (dist(b, { x: px, y: py }) < POCKET_R) {
                        b.sunk = true; b.vx = 0; b.vy = 0;
                        if (b === s.balls[0]) { b.sunk = false; b.x = 180; b.y = H / 2; }
                        else { s.s[s.turn]++; setScores([...s.s]); }
                    }
                });
            });

            // Ball collisions
            for (let i = 0; i < s.balls.length; i++) {
                for (let j = i + 1; j < s.balls.length; j++) {
                    const a = s.balls[i], b = s.balls[j];
                    if (a.sunk || b.sunk) continue;
                    const d = dist(a, b);
                    if (d < BR * 2) {
                        const nx = (b.x - a.x) / d, ny = (b.y - a.y) / d;
                        const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
                        const p = dvx * nx + dvy * ny;
                        a.vx -= p * nx; a.vy -= p * ny; b.vx += p * nx; b.vy += p * ny;
                        const overlap = BR * 2 - d + 1;
                        a.x -= nx * overlap / 2; a.y -= ny * overlap / 2; b.x += nx * overlap / 2; b.y += ny * overlap / 2;
                    }
                }
            }

            if (!moving && s.balls[0].vx === 0) { s.turn = 1 - s.turn; setTurn(s.turn); }

            const activeBalls = s.balls.filter(b => !b.sunk && b !== s.balls[0]).length;
            if (activeBalls === 0) {
                setWinner(s.s[0] >= s.s[1] ? 'Player 1' : 'Player 2'); setPhase('end');
                onScoreUpdate?.(Math.max(s.s[0], s.s[1])); return;
            }

            // Draw
            ctx.fillStyle = '#0d5e2d'; ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = '#4a2800'; ctx.lineWidth = 8; ctx.strokeRect(0, 0, W, H);
            POCKETS.forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, POCKET_R, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill(); });
            s.balls.forEach(b => { if (b.sunk) return; ctx.beginPath(); ctx.arc(b.x, b.y, BR, 0, Math.PI * 2); ctx.fillStyle = b.color; ctx.fill(); ctx.strokeStyle = '#0005'; ctx.lineWidth = 1; ctx.stroke(); });

            if (s.dragging) {
                const cue = s.balls[0];
                ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + (s.sx - s.dx) * 0.3, cue.y + (s.sy - s.dy) * 0.3);
                ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 3; ctx.stroke();
            }

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); canvas.removeEventListener('mousedown', onMD); canvas.removeEventListener('mousemove', onMM); canvas.removeEventListener('mouseup', onMU); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎱</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Pool</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Sink the balls! Drag from cue ball to shoot.</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>Click cue ball → drag → release to shoot</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && <p style={{ fontFamily: 'Orbitron', fontSize: '.85rem', color: turn === 0 ? '#FF6B6B' : '#4D96FF' }}>Player {turn + 1}'s turn — Score: {scores[0]} vs {scores[1]}</p>}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%', cursor: 'crosshair' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {winner} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{scores[0]} – {scores[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
