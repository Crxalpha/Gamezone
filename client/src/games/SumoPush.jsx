import { useRef, useEffect, useState, useCallback } from 'react';

const W = 500, H = 300, ARENA_L = 50, ARENA_R_X = 450, PLAYER_W = 30, PLAYER_H = 40, BEST_OF = 3;

export default function SumoPush({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => {
        stateRef.current = { p1x: 150, p2x: 350, p1v: 0, p2v: 0, p1charge: false, p2charge: false, s: [0, 0], keys: {} };
        setScores([0, 0]); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');
        const onKey = (e) => { s.keys[e.key] = e.type === 'keydown'; e.preventDefault(); };
        window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

        const loop = () => {
            const spd = 3, charge = 8;
            if (s.keys['a'] || s.keys['A']) s.p1v = -spd;
            else if (s.keys['d'] || s.keys['D']) s.p1v = spd;
            else s.p1v *= 0.85;
            if (s.keys['w'] || s.keys['W']) s.p1charge = true; else s.p1charge = false;

            if (s.keys['ArrowLeft']) s.p2v = -spd;
            else if (s.keys['ArrowRight']) s.p2v = spd;
            else s.p2v *= 0.85;
            if (s.keys['ArrowUp']) s.p2charge = true; else s.p2charge = false;

            s.p1x += s.p1v; s.p2x += s.p2v;

            // Collision between players
            if (Math.abs(s.p1x - s.p2x) < PLAYER_W) {
                const pushForce = s.p1charge ? charge : s.p2charge ? -charge : 3;
                if (s.p1x < s.p2x) { s.p2x += pushForce; s.p1x -= pushForce * 0.3; }
                else { s.p1x += pushForce; s.p2x -= pushForce * 0.3; }
            }

            // Check out of ring
            if (s.p1x < ARENA_L || s.p1x > ARENA_R_X) { s.s[1]++; s.p1x = 150; s.p2x = 350; }
            if (s.p2x < ARENA_L || s.p2x > ARENA_R_X) { s.s[0]++; s.p1x = 150; s.p2x = 350; }
            setScores([...s.s]);

            if (s.s[0] >= BEST_OF || s.s[1] >= BEST_OF) {
                setWinner(s.s[0] >= BEST_OF ? 'Player 1' : 'Player 2'); setPhase('end');
                onScoreUpdate?.(Math.max(s.s[0], s.s[1])); return;
            }

            // Draw
            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            // Arena
            ctx.fillStyle = '#2a1a0a'; ctx.beginPath();
            ctx.ellipse(W / 2, H - 40, 220, 50, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#FFD93D44'; ctx.lineWidth = 3; ctx.stroke();
            // Boundary markers
            ctx.fillStyle = '#FF6B6B44'; ctx.fillRect(ARENA_L - 5, H - 100, 5, 70);
            ctx.fillRect(ARENA_R_X, H - 100, 5, 70);
            // Players
            const y = H - 100;
            ctx.fillStyle = s.p1charge ? '#ff4444' : '#FF6B6B';
            ctx.fillRect(s.p1x - PLAYER_W / 2, y, PLAYER_W, PLAYER_H);
            ctx.fillStyle = '#fff'; ctx.font = '16px Poppins'; ctx.textAlign = 'center'; ctx.fillText('P1', s.p1x, y + 25);

            ctx.fillStyle = s.p2charge ? '#2266ff' : '#4D96FF';
            ctx.fillRect(s.p2x - PLAYER_W / 2, y, PLAYER_W, PLAYER_H);
            ctx.fillStyle = '#fff'; ctx.fillText('P2', s.p2x, y + 25);

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
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤼</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Sumo Push</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Push opponent out of the ring! Hold charge key for power push.</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>P1: A/D + W(charge) &nbsp;|&nbsp; P2: ←/→ + ↑(charge)</p>
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
