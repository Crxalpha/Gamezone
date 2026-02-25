import { useRef, useEffect, useState, useCallback } from 'react';

const W = 400, H = 400, ARENA_R = 160, SPR = 16;

export default function SpinnerWar({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [winner, setWinner] = useState(null);
    const BEST_OF = 3;

    const reset = useCallback(() => {
        stateRef.current = { p1: { x: W / 2 - 50, y: H / 2, vx: 0, vy: 0 }, p2: { x: W / 2 + 50, y: H / 2, vx: 0, vy: 0 }, s: [0, 0], keys: {} };
        setScores([0, 0]); setWinner(null); setPhase('play');
    }, []);

    const resetPos = (s) => { s.p1.x = W / 2 - 50; s.p1.y = H / 2; s.p2.x = W / 2 + 50; s.p2.y = H / 2; s.p1.vx = s.p1.vy = s.p2.vx = s.p2.vy = 0; };

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');
        const onKey = (e) => { s.keys[e.key] = e.type === 'keydown'; e.preventDefault(); };
        window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

        const loop = () => {
            const acc = 0.4, fric = 0.96;
            if (s.keys['a'] || s.keys['A']) s.p1.vx -= acc;
            if (s.keys['d'] || s.keys['D']) s.p1.vx += acc;
            if (s.keys['w'] || s.keys['W']) s.p1.vy -= acc;
            if (s.keys['s'] || s.keys['S']) s.p1.vy += acc;
            if (s.keys['ArrowLeft']) s.p2.vx -= acc;
            if (s.keys['ArrowRight']) s.p2.vx += acc;
            if (s.keys['ArrowUp']) s.p2.vy -= acc;
            if (s.keys['ArrowDown']) s.p2.vy += acc;

            [s.p1, s.p2].forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= fric; p.vy *= fric; });

            // Collision
            const dx = s.p2.x - s.p1.x, dy = s.p2.y - s.p1.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < SPR * 2) {
                const nx = dx / d, ny = dy / d; const push = 3;
                s.p1.vx -= nx * push; s.p1.vy -= ny * push; s.p2.vx += nx * push; s.p2.vy += ny * push;
            }

            // Check out of arena
            const cx = W / 2, cy = H / 2;
            const d1 = Math.sqrt((s.p1.x - cx) ** 2 + (s.p1.y - cy) ** 2);
            const d2 = Math.sqrt((s.p2.x - cx) ** 2 + (s.p2.y - cy) ** 2);
            if (d1 > ARENA_R) { s.s[1]++; resetPos(s); }
            if (d2 > ARENA_R) { s.s[0]++; resetPos(s); }
            setScores([...s.s]);

            if (s.s[0] >= BEST_OF || s.s[1] >= BEST_OF) {
                setWinner(s.s[0] >= BEST_OF ? 'Player 1' : 'Player 2'); setPhase('end');
                onScoreUpdate?.(Math.max(s.s[0], s.s[1])); return;
            }

            // Draw
            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            ctx.beginPath(); ctx.arc(cx, cy, ARENA_R, 0, Math.PI * 2);
            ctx.fillStyle = '#1B1E3F'; ctx.fill(); ctx.strokeStyle = '#FFD93D33'; ctx.lineWidth = 3; ctx.stroke();
            // Spinners
            const t = Date.now() * 0.01;
            [[s.p1, '#FF6B6B'], [s.p2, '#4D96FF']].forEach(([p, col]) => {
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t);
                for (let i = 0; i < 3; i++) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -SPR * 0.7, 6, SPR * 0.7, (i * Math.PI * 2) / 3, 0, Math.PI * 2); ctx.fill(); }
                ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
                ctx.restore();
            });
            ctx.fillStyle = '#FF6B6B'; ctx.font = 'bold 24px Orbitron'; ctx.textAlign = 'left'; ctx.fillText(s.s[0], 16, 30);
            ctx.fillStyle = '#4D96FF'; ctx.textAlign = 'right'; ctx.fillText(s.s[1], W - 16, 30);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌀</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Spinner War</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Push opponent out of the arena! Best of {BEST_OF}.</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>P1: WASD &nbsp;|&nbsp; P2: Arrows</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {winner} Wins!</h3>
                    <button type="button" onClick={reset} className="btn btn-primary" style={{ marginTop: 8 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
