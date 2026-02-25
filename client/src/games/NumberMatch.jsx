import { useState, useEffect, useCallback } from 'react';

const SIZE = 4;
const init = () => {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    addRandom(grid); addRandom(grid);
    return grid;
};
function addRandom(grid) {
    const empty = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

const TILE_COLORS = {
    0: '#1B1E3F', 2: '#4D96FF', 4: '#6BCB77', 8: '#FFD93D', 16: '#FF9F1C',
    32: '#FF6B6B', 64: '#C77DFF', 128: '#f72585', 256: '#06d6a0',
    512: '#3b82f6', 1024: '#a855f7', 2048: '#fbbf24'
};

export default function NumberMatch({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [grid, setGrid] = useState(init());
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const reset = useCallback(() => {
        const g = init(); setGrid(g); setScore(0); setGameOver(false); setPhase('play');
    }, []);

    const slide = useCallback((dir) => {
        if (gameOver) return;
        const g = grid.map(r => [...r]);
        let moved = false, pts = 0;

        const compress = (line) => {
            const filtered = line.filter(x => x !== 0);
            const result = [];
            for (let i = 0; i < filtered.length; i++) {
                if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                    result.push(filtered[i] * 2); pts += filtered[i] * 2; i++;
                } else result.push(filtered[i]);
            }
            while (result.length < SIZE) result.push(0);
            return result;
        };

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                let line;
                if (dir === 'left') line = g[r];
                else if (dir === 'right') line = [...g[r]].reverse();
                else if (dir === 'up') line = g.map(row => row[c]);
                else line = g.map(row => row[c]).reverse();
                if (dir === 'left' || dir === 'right') { break; }
                if (dir === 'up' || dir === 'down') { break; }
            }
        }

        // Apply slide properly
        if (dir === 'left' || dir === 'right') {
            for (let r = 0; r < SIZE; r++) {
                let line = dir === 'left' ? [...g[r]] : [...g[r]].reverse();
                const result = compress(line);
                if (dir === 'right') result.reverse();
                if (JSON.stringify(result) !== JSON.stringify(g[r])) moved = true;
                g[r] = result;
            }
        } else {
            for (let c = 0; c < SIZE; c++) {
                let line = g.map(row => row[c]);
                if (dir === 'down') line.reverse();
                const result = compress(line);
                if (dir === 'down') result.reverse();
                if (JSON.stringify(result) !== JSON.stringify(line)) moved = true;
                for (let r = 0; r < SIZE; r++) g[r][c] = result[r];
            }
        }

        if (moved) {
            addRandom(g); setGrid(g); setScore(s => s + pts);
            // Check game over
            let canMove = false;
            for (let r = 0; r < SIZE && !canMove; r++)
                for (let c = 0; c < SIZE && !canMove; c++) {
                    if (g[r][c] === 0) canMove = true;
                    if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) canMove = true;
                    if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) canMove = true;
                }
            if (!canMove) { setGameOver(true); setPhase('end'); onScoreUpdate?.(score + pts); }
        }
    }, [grid, score, gameOver, onScoreUpdate]);

    useEffect(() => {
        if (phase !== 'play') return;
        const onKey = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') slide('left');
            else if (e.key === 'ArrowRight' || e.key === 'd') slide('right');
            else if (e.key === 'ArrowUp' || e.key === 'w') slide('up');
            else if (e.key === 'ArrowDown' || e.key === 's') slide('down');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, slide]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔢</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Number Match</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Slide & merge tiles! Get the highest score.</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>Arrow keys or WASD to slide</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: '#FFD93D', marginBottom: 12 }}>Score: {score}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 8, padding: 12, background: '#0a0d1f', borderRadius: 16 }}>
                        {grid.flat().map((val, i) => (
                            <div key={i} style={{
                                width: 72, height: 72, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: TILE_COLORS[val] || '#f72585', color: '#fff',
                                fontFamily: 'Orbitron', fontSize: val >= 100 ? '1rem' : '1.3rem', fontWeight: 'bold',
                                transition: 'all .15s', boxShadow: val ? `0 0 10px ${TILE_COLORS[val]}44` : 'none'
                            }}>
                                {val || ''}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>Game Over!</h3>
                    <p style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: '#6BCB77', marginBottom: 12 }}>Score: {score}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
