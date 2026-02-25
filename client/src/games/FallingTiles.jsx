import { useRef, useEffect, useState, useCallback } from 'react';

const W = 500, H = 500, PW = 30, PH = 20, TILE_H = 20;

export default function FallingTiles({ onScoreUpdate }) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const animRef = useRef(null);
    const [phase, setPhase] = useState('menu');
    const [score, setScore] = useState(0);

    const reset = useCallback(() => {
        stateRef.current = {
            px: W / 2, tiles: [], frame: 0, speed: 2, alive: true, keys: {},
            spawnRate: 40
        };
        setScore(0); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const s = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');
        const onKey = (e) => { s.keys[e.key] = e.type === 'keydown'; };
        window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

        const loop = () => {
            if (!s.alive) return;
            s.frame++;

            if (s.keys['ArrowLeft'] || s.keys['a'] || s.keys['A']) s.px = Math.max(PW / 2, s.px - 4);
            if (s.keys['ArrowRight'] || s.keys['d'] || s.keys['D']) s.px = Math.min(W - PW / 2, s.px + 4);

            if (s.frame % s.spawnRate === 0) {
                const gapX = Math.random() * (W - 80) + 40;
                const gapW = 60 + Math.random() * 40;
                s.tiles.push(
                    { x: 0, y: -TILE_H, w: gapX - gapW / 2, h: TILE_H },
                    { x: gapX + gapW / 2, y: -TILE_H, w: W - gapX - gapW / 2, h: TILE_H }
                );
            }

            s.tiles.forEach(t => t.y += s.speed);
            s.tiles = s.tiles.filter(t => t.y < H + 20);

            // Collision
            const py = H - 40;
            for (const t of s.tiles) {
                if (s.px + PW / 2 > t.x && s.px - PW / 2 < t.x + t.w && py + PH > t.y && py < t.y + t.h) {
                    s.alive = false; setPhase('end'); onScoreUpdate?.(Math.floor(s.frame / 60)); return;
                }
            }

            if (s.frame % 600 === 0) { s.speed += 0.3; s.spawnRate = Math.max(20, s.spawnRate - 3); }
            setScore(Math.floor(s.frame / 60));

            // Draw
            ctx.fillStyle = '#0F1020'; ctx.fillRect(0, 0, W, H);
            s.tiles.forEach(t => { ctx.fillStyle = '#FF6B6B'; ctx.fillRect(t.x, t.y, t.w, t.h); });
            ctx.fillStyle = '#4D96FF'; ctx.fillRect(s.px - PW / 2, py, PW, PH);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText(Math.floor(s.frame / 60) + 's', W / 2, 30);

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
    }, [phase, onScoreUpdate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>⬇️</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Falling Tiles</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Dodge falling tiles through the gaps. Survive!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>A/D or ←/→ to move</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, maxWidth: '100%' }} />}
            {phase === 'end' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>Game Over!</h3>
                    <p style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: '#6BCB77' }}>Survived: {score}s</p>
                    <button type="button" onClick={reset} className="btn btn-primary" style={{ marginTop: 12 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
