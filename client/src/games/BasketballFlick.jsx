import { useState, useEffect, useRef, useCallback } from 'react';

const ROUNDS = 10, HOOP_X = 250, HOOP_Y = 80, GRAVITY = 0.3;

export default function BasketballFlick({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [scores, setScores] = useState([0, 0]);
    const [turn, setTurn] = useState(0);
    const [round, setRound] = useState(0);
    const stateRef = useRef(null);

    const reset = useCallback(() => {
        stateRef.current = { bx: 250, by: 400, bvx: 0, bvy: 0, dragging: false, sx: 0, sy: 0, flying: false, scored: false };
        setScores([0, 0]); setTurn(0); setRound(0); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const W = 500, H = 500;
        const rect = () => canvas.getBoundingClientRect();

        const onMD = (e) => {
            if (s.flying) return;
            const r = rect(); const mx = (e.clientX - r.left) * (W / r.width); const my = (e.clientY - r.top) * (H / r.height);
            if (Math.sqrt((mx - s.bx) ** 2 + (my - s.by) ** 2) < 30) { s.dragging = true; s.sx = mx; s.sy = my; }
        };
        const onMM = (e) => {
            if (!s.dragging) return;
            const r = rect(); s.dx = (e.clientX - r.left) * (W / r.width); s.dy = (e.clientY - r.top) * (H / r.height);
        };
        const onMU = () => {
            if (!s.dragging) return; s.dragging = false;
            s.bvx = (s.sx - (s.dx || s.sx)) * 0.12; s.bvy = (s.sy - (s.dy || s.sy)) * 0.12;
            s.flying = true; s.scored = false;
        };
        canvas.addEventListener('mousedown', onMD); canvas.addEventListener('mousemove', onMM); canvas.addEventListener('mouseup', onMU);

        const loop = () => {
            if (s.flying) {
                s.bx += s.bvx; s.by += s.bvy; s.bvy += GRAVITY;
                if (Math.abs(s.bx - HOOP_X) < 25 && Math.abs(s.by - HOOP_Y) < 15 && s.bvy > 0 && !s.scored) {
                    s.scored = true;
                    const newS = [...scores]; newS[turn] += (Math.abs(s.bx - HOOP_X) < 8 ? 3 : 2); setScores(newS);
                }
                if (s.by > 500 || s.bx < -30 || s.bx > 530) {
                    s.flying = false; s.bx = 250; s.by = 400; s.bvx = 0; s.bvy = 0;
                    const nextT = 1 - turn; const nextR = nextT === 0 ? round + 1 : round;
                    if (nextR >= ROUNDS) {
                        setPhase('end'); onScoreUpdate?.(Math.max(scores[0], scores[1])); return;
                    }
                    setTurn(nextT); setRound(nextR);
                }
            }

            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            // Backboard
            ctx.fillStyle = '#444'; ctx.fillRect(HOOP_X + 20, HOOP_Y - 40, 8, 60);
            ctx.fillStyle = '#FF9F1C'; ctx.fillRect(HOOP_X - 30, HOOP_Y - 3, 60, 6);
            // Net lines
            ctx.strokeStyle = '#fff3'; ctx.lineWidth = 1;
            for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(HOOP_X + i * 12, HOOP_Y + 3); ctx.lineTo(HOOP_X + i * 8, HOOP_Y + 40); ctx.stroke(); }
            // Ball
            ctx.beginPath(); ctx.arc(s.bx, s.by, 18, 0, Math.PI * 2); ctx.fillStyle = '#FF9F1C'; ctx.fill();
            ctx.strokeStyle = '#a55800'; ctx.lineWidth = 2; ctx.stroke();
            // Drag line
            if (s.dragging && s.dx) {
                ctx.beginPath(); ctx.moveTo(s.bx, s.by);
                ctx.lineTo(s.bx + (s.sx - s.dx) * 0.4, s.by + (s.sy - s.dy) * 0.4);
                ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 3; ctx.stroke();
            }
            ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText(`P1: ${scores[0]}`, 100, 30); ctx.fillText(`P2: ${scores[1]}`, 400, 30);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); canvas.removeEventListener('mousedown', onMD); canvas.removeEventListener('mousemove', onMM); canvas.removeEventListener('mouseup', onMU); };
    }, [phase, turn, round, scores, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏀</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Basketball Flick</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Drag from ball to shoot! {ROUNDS} rounds each.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && <p style={{ fontFamily: 'Orbitron', fontSize: '.85rem', color: turn === 0 ? '#FF6B6B' : '#4D96FF' }}>Player {turn + 1}'s shot — Round {round + 1}/{ROUNDS}</p>}
            {phase !== 'menu' && <canvas ref={canvasRef} width={500} height={500} style={{ borderRadius: 12, maxWidth: '100%', cursor: 'grab' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {scores[0] >= scores[1] ? 'Player 1' : 'Player 2'} Wins!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>{scores[0]} – {scores[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
