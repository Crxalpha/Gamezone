import { useState, useEffect, useCallback } from 'react';

const ROWS = 6, COLS = 7;
const empty = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

/* AI: evaluate board for scoring columns */
function getAIMove(board) {
    // 1. Check if AI can win
    for (let c = 0; c < COLS; c++) {
        const r = getDropRow(board, c);
        if (r < 0) continue;
        board[r][c] = 1;
        if (checkFour(board, r, c, 1)) { board[r][c] = null; return c; }
        board[r][c] = null;
    }
    // 2. Block opponent win
    for (let c = 0; c < COLS; c++) {
        const r = getDropRow(board, c);
        if (r < 0) continue;
        board[r][c] = 0;
        if (checkFour(board, r, c, 0)) { board[r][c] = null; return c; }
        board[r][c] = null;
    }
    // 3. Prefer center, then evaluate
    const scores = [];
    for (let c = 0; c < COLS; c++) {
        const r = getDropRow(board, c);
        if (r < 0) { scores.push(-Infinity); continue; }
        let s = 0;
        s += Math.abs(c - 3) === 0 ? 4 : Math.abs(c - 3) <= 1 ? 2 : 0;
        board[r][c] = 1;
        s += countThreats(board, r, c, 1) * 3;
        board[r][c] = null;
        scores.push(s);
    }
    const max = Math.max(...scores);
    const best = scores.reduce((acc, s, i) => s === max ? [...acc, i] : acc, []);
    return best[Math.floor(Math.random() * best.length)];
}

function getDropRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === null) return r;
    return -1;
}

function checkFour(b, r, c, p) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) {
        let count = 1;
        for (let d = 1; d <= 3; d++) { const nr = r + dr * d, nc = c + dc * d; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) count++; else break; }
        for (let d = 1; d <= 3; d++) { const nr = r - dr * d, nc = c - dc * d; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) count++; else break; }
        if (count >= 4) return true;
    }
    return false;
}

function countThreats(b, r, c, p) {
    let threats = 0;
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) {
        let count = 1;
        for (let d = 1; d <= 3; d++) { const nr = r + dr * d, nc = c + dc * d; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) count++; else break; }
        for (let d = 1; d <= 3; d++) { const nr = r - dr * d, nc = c - dc * d; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) count++; else break; }
        if (count >= 3) threats++;
    }
    return threats;
}

export default function Connect4({ onScoreUpdate }) {
    const [mode, setMode] = useState(null);
    const [board, setBoard] = useState(empty());
    const [turn, setTurn] = useState(0);
    const [winner, setWinner] = useState(null);
    const [winCells, setWinCells] = useState([]);

    const checkWin = (b, r, c, p) => {
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of dirs) {
            const cells = [];
            for (let i = -3; i <= 3; i++) {
                const nr = r + dr * i, nc = c + dc * i;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) {
                    cells.push([nr, nc]);
                    if (cells.length === 4) return cells;
                } else cells.length = 0;
            }
        }
        return null;
    };

    const drop = useCallback((col) => {
        if (winner) return;
        if (mode === 'bot' && turn === 1) return;
        const b = board.map(r => [...r]);
        for (let r = ROWS - 1; r >= 0; r--) {
            if (b[r][col] === null) {
                b[r][col] = turn; setBoard(b);
                const win = checkWin(b, r, col, turn);
                if (win) { setWinner(turn === 0 ? 'Red' : 'Yellow'); setWinCells(win); onScoreUpdate?.(1); return; }
                if (b[0].every(cell => cell !== null)) { setWinner('Draw'); return; }
                setTurn(1 - turn); return;
            }
        }
    }, [board, turn, winner, mode, onScoreUpdate]);

    // Bot turn
    useEffect(() => {
        if (mode !== 'bot' || turn !== 1 || winner) return;
        const timer = setTimeout(() => {
            const b = board.map(r => [...r]);
            const col = getAIMove(b);
            if (col >= 0) {
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (b[r][col] === null) {
                        b[r][col] = 1; setBoard(b);
                        const win = checkWin(b, r, col, 1);
                        if (win) { setWinner('Yellow (Bot)'); setWinCells(win); return; }
                        if (b[0].every(cell => cell !== null)) { setWinner('Draw'); return; }
                        setTurn(0); return;
                    }
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [mode, turn, winner, board]);

    const reset = useCallback(() => { setBoard(empty()); setTurn(0); setWinner(null); setWinCells([]); }, []);
    const isWinCell = (r, c) => winCells.some(([wr, wc]) => wr === r && wc === c);
    const colors = ['#FF6B6B', '#FFD93D'];

    if (!mode) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔴🟡</div>
                <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Connect 4</h2>
                <p style={{ color: '#B8C1EC', marginBottom: 20 }}>Drop discs, connect 4 in a row!</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '0 auto' }}>
                    <button type="button" className="btn btn-primary" onClick={() => { setMode('friend'); reset(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '16px 24px', fontSize: '1rem' }}>
                        👤 <span><small style={{ opacity: .7 }}>PLAY VS.</small><br /><strong>FRIEND</strong></span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setMode('bot'); reset(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '16px 24px', fontSize: '1rem', background: 'linear-gradient(135deg, #FF9F1C, #FF6B6B)' }}>
                        🤖 <span><small style={{ opacity: .7 }}>PLAY VS.</small><br /><strong>BOT</strong></span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
                {!winner && <p style={{ fontFamily: 'Orbitron', fontSize: '.9rem', color: colors[turn], marginBottom: 8 }}>{turn === 0 ? (mode === 'bot' ? 'Your' : "Red's") : (mode === 'bot' ? "🤖 Bot's" : "Yellow's")} Turn</p>}
                {winner && <p style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#FFD93D', marginBottom: 8 }}>🏆 {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}</p>}
                <div style={{ background: '#1a3a8a', borderRadius: 16, padding: 8, display: 'inline-block' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 4, marginBottom: 4 }}>
                        {Array.from({ length: COLS }).map((_, c) => (
                            <button type="button" key={c} onClick={() => drop(c)} disabled={!!winner || (mode === 'bot' && turn === 1)} style={{
                                width: 48, height: 20, borderRadius: 8, border: 'none', cursor: winner || (mode === 'bot' && turn === 1) ? 'default' : 'pointer',
                                background: 'transparent', color: '#fff', fontSize: '1rem', opacity: winner ? 0.3 : 1
                            }}>▼</button>
                        ))}
                    </div>
                    {board.map((row, r) => (
                        <div key={r} style={{ display: 'flex', gap: 4 }}>
                            {row.map((cell, c) => (
                                <div key={c} onClick={() => drop(c)} style={{
                                    width: 48, height: 48, borderRadius: '50%', cursor: winner ? 'default' : 'pointer',
                                    background: cell === null ? '#0a1a42' : colors[cell],
                                    border: isWinCell(r, c) ? '3px solid #fff' : '2px solid #0a1a42',
                                    transition: 'all .2s', boxShadow: cell !== null ? `0 0 8px ${colors[cell]}44` : 'none'
                                }} />
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button type="button" className="btn btn-secondary" onClick={reset}>🔄 Restart</button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setMode(null); reset(); }}>← Back</button>
                </div>
            </div>
        </div>
    );
}
