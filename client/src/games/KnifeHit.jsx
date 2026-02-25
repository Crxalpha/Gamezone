import { useRef, useEffect, useState, useCallback } from 'react';

const W = 400, H = 500, LOG_R = 50, KNIFE_W = 6, KNIFE_H = 30;

export default function KnifeHit({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    const reset = useCallback(() => {
        stateRef.current = {
            knives: [], angle: 0, stuck: [], remaining: 8, speed: 0.02, failed: false,
            throwing: false, ky: H - 60, kvy: 0
        };
        setScore(0); setLevel(1); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');

        const onClick = () => {
            if (s.throwing || s.failed) return;
            s.throwing = true; s.kvy = -12;
        };
        window.addEventListener('click', onClick);

        const loop = () => {
            s.angle += s.speed;

            if (s.throwing) {
                s.ky += s.kvy;
                if (s.ky <= 200 + LOG_R + KNIFE_H) {
                    // Check collision with stuck knives
                    const newAngle = s.angle;
                    let hit = false;
                    for (const ka of s.stuck) {
                        const diff = Math.abs(((newAngle - ka) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
                        if (diff < 0.25) { hit = true; break; }
                    }
                    if (hit) {
                        s.failed = true; s.throwing = false;
                        setTimeout(() => { setPhase('end'); onScoreUpdate?.(score); }, 800);
                    } else {
                        s.stuck.push(newAngle);
                        s.throwing = false; s.ky = H - 60;
                        s.remaining--;
                        setScore(sc => sc + 1);
                        if (s.remaining <= 0) {
                            setLevel(l => l + 1); s.remaining = 8 + level; s.stuck = []; s.speed += 0.005;
                        }
                    }
                }
            }

            // Draw
            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            const cx = W / 2, cy = 200;

            // Log
            ctx.beginPath(); ctx.arc(cx, cy, LOG_R, 0, Math.PI * 2);
            ctx.fillStyle = '#6B4423'; ctx.fill(); ctx.strokeStyle = '#4a2800'; ctx.lineWidth = 3; ctx.stroke();
            // Inner rings
            ctx.beginPath(); ctx.arc(cx, cy, LOG_R * 0.6, 0, Math.PI * 2); ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, LOG_R * 0.3, 0, Math.PI * 2); ctx.stroke();

            // Stuck knives
            s.stuck.forEach(ka => {
                const dist = LOG_R + KNIFE_H * 0.5;
                const kx = cx + Math.cos(ka + s.angle) * dist;
                const ky2 = cy + Math.sin(ka + s.angle) * dist;
                ctx.save(); ctx.translate(kx, ky2); ctx.rotate(ka + s.angle + Math.PI / 2);
                ctx.fillStyle = '#ccc'; ctx.fillRect(-KNIFE_W / 2, -KNIFE_H / 2, KNIFE_W, KNIFE_H);
                ctx.fillStyle = '#666'; ctx.fillRect(-KNIFE_W / 2, KNIFE_H / 4, KNIFE_W, KNIFE_H / 4);
                ctx.restore();
            });

            // Current knife
            if (!s.failed) {
                ctx.fillStyle = '#ccc'; ctx.fillRect(cx - KNIFE_W / 2, s.ky, KNIFE_W, KNIFE_H);
                ctx.fillStyle = '#888'; ctx.fillRect(cx - KNIFE_W / 2, s.ky + KNIFE_H * 0.7, KNIFE_W, KNIFE_H * 0.3);
            }

            // UI
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText(`Level ${level}`, cx, 30);
            ctx.fillStyle = '#B8C1EC'; ctx.font = '14px Poppins';
            ctx.fillText(`Knives: ${s.remaining}`, cx, 55);

            if (s.failed) {
                ctx.fillStyle = '#FF6B6Bcc'; ctx.font = 'bold 28px Orbitron';
                ctx.fillText('HIT! ✖', cx, H - 100);
            }

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('click', onClick); };
    }, [phase, score, level, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔪</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Knife Hit</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Throw knives at the spinning log. Don't hit another knife!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>Click/tap to throw</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%', cursor: 'pointer' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>Game Over!</h3>
                    <p style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: '#6BCB77' }}>Score: {score}</p>
                    <button type="button" onClick={reset} className="btn btn-primary" style={{ marginTop: 12 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
