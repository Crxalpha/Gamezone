import { useRef, useEffect, useState, useCallback } from 'react';

const W = 600, H = 400, PAD_W = 12, PAD_H = 80, BALL_R = 8, WIN = 7;

export default function PingPong({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => {
        stateRef.current = {
            p1: H / 2, p2: H / 2,
            bx: W / 2, by: H / 2,
            bdx: 4 * (Math.random() > 0.5 ? 1 : -1),
            bdy: 3 * (Math.random() > 0.5 ? 1 : -1),
            s: [0, 0], keys: {}
        };
        setScores([0, 0]); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const onKey = (e) => { s.keys[e.key] = e.type === 'keydown'; };
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKey);

        const loop = () => {
            // Move paddles
            if (s.keys['w'] || s.keys['W']) s.p1 = Math.max(PAD_H / 2, s.p1 - 5);
            if (s.keys['s'] || s.keys['S']) s.p1 = Math.min(H - PAD_H / 2, s.p1 + 5);
            if (s.keys['ArrowUp']) s.p2 = Math.max(PAD_H / 2, s.p2 - 5);
            if (s.keys['ArrowDown']) s.p2 = Math.min(H - PAD_H / 2, s.p2 + 5);

            // Move ball
            s.bx += s.bdx; s.by += s.bdy;
            if (s.by - BALL_R <= 0 || s.by + BALL_R >= H) s.bdy *= -1;

            // Paddle collisions
            if (s.bx - BALL_R <= PAD_W + 16 && s.by > s.p1 - PAD_H / 2 && s.by < s.p1 + PAD_H / 2 && s.bdx < 0) {
                s.bdx = Math.abs(s.bdx) * 1.05; s.bdy += (s.by - s.p1) * 0.1;
            }
            if (s.bx + BALL_R >= W - PAD_W - 16 && s.by > s.p2 - PAD_H / 2 && s.by < s.p2 + PAD_H / 2 && s.bdx > 0) {
                s.bdx = -Math.abs(s.bdx) * 1.05; s.bdy += (s.by - s.p2) * 0.1;
            }

            // Score
            if (s.bx < 0) { s.s[1]++; s.bx = W / 2; s.by = H / 2; s.bdx = 4; s.bdy = 3 * (Math.random() > 0.5 ? 1 : -1); }
            if (s.bx > W) { s.s[0]++; s.bx = W / 2; s.by = H / 2; s.bdx = -4; s.bdy = 3 * (Math.random() > 0.5 ? 1 : -1); }
            setScores([...s.s]);

            if (s.s[0] >= WIN || s.s[1] >= WIN) {
                const w = s.s[0] >= WIN ? 'Player 1' : 'Player 2';
                setWinner(w); setPhase('end');
                onScoreUpdate?.(Math.max(s.s[0], s.s[1]));
                return;
            }

            // Draw
            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            ctx.setLineDash([8, 8]); ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);

            ctx.fillStyle = '#FF6B6B'; ctx.fillRect(16, s.p1 - PAD_H / 2, PAD_W, PAD_H);
            ctx.fillStyle = '#4D96FF'; ctx.fillRect(W - 16 - PAD_W, s.p2 - PAD_H / 2, PAD_W, PAD_H);

            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#FF6B6B'; ctx.font = 'bold 36px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText(s.s[0], W / 4, 50);
            ctx.fillStyle = '#4D96FF'; ctx.fillText(s.s[1], 3 * W / 4, 50);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏓</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Ping Pong</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>First to {WIN} wins!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>P1: W/S &nbsp;|&nbsp; P2: ↑/↓</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%', background: '#0F1020' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>🏆 {winner} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{scores[0]} – {scores[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
