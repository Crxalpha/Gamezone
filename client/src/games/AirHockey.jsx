import { useRef, useEffect, useState, useCallback } from 'react';

const W = 500, H = 600, PUCK_R = 14, MAL_R = 24, WIN = 5, GOAL_W = 120;

export default function AirHockey({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [winner, setWinner] = useState(null);

    const resetPuck = (s) => { s.px = W / 2; s.py = H / 2; s.pvx = 0; s.pvy = 0; };

    const reset = useCallback(() => {
        const s = { m1x: W / 2, m1y: H - 60, m2x: W / 2, m2y: 60, px: W / 2, py: H / 2, pvx: 0, pvy: 0, s: [0, 0], keys: {} };
        stateRef.current = s;
        setScores([0, 0]); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');
        const spd = 5;

        const onKey = (e) => { s.keys[e.key] = e.type === 'keydown'; e.preventDefault(); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKey);

        const loop = () => {
            // Move mallets
            if (s.keys['w'] || s.keys['W']) s.m1y = Math.max(H / 2 + MAL_R, s.m1y - spd);
            if (s.keys['s'] || s.keys['S']) s.m1y = Math.min(H - MAL_R, s.m1y + spd);
            if (s.keys['a'] || s.keys['A']) s.m1x = Math.max(MAL_R, s.m1x - spd);
            if (s.keys['d'] || s.keys['D']) s.m1x = Math.min(W - MAL_R, s.m1x + spd);
            if (s.keys['ArrowUp']) s.m2y = Math.max(MAL_R, s.m2y - spd);
            if (s.keys['ArrowDown']) s.m2y = Math.min(H / 2 - MAL_R, s.m2y + spd);
            if (s.keys['ArrowLeft']) s.m2x = Math.max(MAL_R, s.m2x - spd);
            if (s.keys['ArrowRight']) s.m2x = Math.min(W - MAL_R, s.m2x + spd);

            // Puck physics
            s.px += s.pvx; s.py += s.pvy;
            s.pvx *= 0.99; s.pvy *= 0.99;
            if (s.px - PUCK_R < 0 || s.px + PUCK_R > W) { s.pvx *= -1; s.px = Math.max(PUCK_R, Math.min(W - PUCK_R, s.px)); }

            // Goals
            const gL = (W - GOAL_W) / 2, gR = (W + GOAL_W) / 2;
            if (s.py - PUCK_R < 0) {
                if (s.px > gL && s.px < gR) { s.s[0]++; resetPuck(s); } else { s.pvy *= -1; s.py = PUCK_R; }
            }
            if (s.py + PUCK_R > H) {
                if (s.px > gL && s.px < gR) { s.s[1]++; resetPuck(s); } else { s.pvy *= -1; s.py = H - PUCK_R; }
            }

            // Mallet-puck collisions
            [[s.m1x, s.m1y], [s.m2x, s.m2y]].forEach(([mx, my]) => {
                const dx = s.px - mx, dy = s.py - my, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < PUCK_R + MAL_R) {
                    const nx = dx / dist, ny = dy / dist;
                    s.pvx = nx * 6; s.pvy = ny * 6;
                    s.px = mx + nx * (PUCK_R + MAL_R + 1); s.py = my + ny * (PUCK_R + MAL_R + 1);
                }
            });

            setScores([...s.s]);
            if (s.s[0] >= WIN || s.s[1] >= WIN) {
                setWinner(s.s[0] >= WIN ? 'Player 1' : 'Player 2'); setPhase('end');
                onScoreUpdate?.(Math.max(s.s[0], s.s[1])); return;
            }

            // Draw
            ctx.fillStyle = '#1a1a3e'; ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2); ctx.stroke();
            // Goals
            ctx.fillStyle = '#FFD93D44'; ctx.fillRect(gL, 0, GOAL_W, 6); ctx.fillRect(gL, H - 6, GOAL_W, 6);
            // Mallets
            ctx.beginPath(); ctx.arc(s.m1x, s.m1y, MAL_R, 0, Math.PI * 2); ctx.fillStyle = '#FF6B6B'; ctx.fill();
            ctx.beginPath(); ctx.arc(s.m2x, s.m2y, MAL_R, 0, Math.PI * 2); ctx.fillStyle = '#4D96FF'; ctx.fill();
            // Puck
            ctx.beginPath(); ctx.arc(s.px, s.py, PUCK_R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
            // Scores
            ctx.fillStyle = '#FF6B6B'; ctx.font = 'bold 28px Orbitron'; ctx.textAlign = 'left'; ctx.fillText(s.s[0], 16, H / 2 + 40);
            ctx.fillStyle = '#4D96FF'; ctx.textAlign = 'right'; ctx.fillText(s.s[1], W - 16, H / 2 - 20);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏒</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Air Hockey</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>First to {WIN} goals wins!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>P1: WASD &nbsp;|&nbsp; P2: Arrow keys</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%', background: '#1a1a3e' }} />}
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
