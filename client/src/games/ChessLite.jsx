import { useState, useCallback } from 'react';

const SIZE = 6;
const PIECES = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

const initBoard = () => {
    const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    // White (bottom): King, Queen, Rook, Bishop, Knight, Pawn row
    b[5] = [{ t: 'R', c: 0 }, { t: 'N', c: 0 }, { t: 'B', c: 0 }, { t: 'Q', c: 0 }, { t: 'K', c: 0 }, { t: 'B', c: 0 }];
    b[4] = Array(SIZE).fill(null).map(() => ({ t: 'P', c: 0 }));
    // Black (top)
    b[0] = [{ t: 'R', c: 1 }, { t: 'N', c: 1 }, { t: 'B', c: 1 }, { t: 'Q', c: 1 }, { t: 'K', c: 1 }, { t: 'B', c: 1 }];
    b[1] = Array(SIZE).fill(null).map(() => ({ t: 'P', c: 1 }));
    return b;
};

export default function ChessLite({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [board, setBoard] = useState(initBoard());
    const [turn, setTurn] = useState(0);
    const [selected, setSelected] = useState(null);
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => { setBoard(initBoard()); setTurn(0); setSelected(null); setWinner(null); setPhase('play'); }, []);

    const isValidMove = (fr, fc, tr, tc, b) => {
        const piece = b[fr][fc]; if (!piece || piece.c !== turn) return false;
        const target = b[tr][tc]; if (target && target.c === turn) return false;
        const dr = tr - fr, dc = tc - fc, adr = Math.abs(dr), adc = Math.abs(dc);

        switch (piece.t) {
            case 'P': {
                const dir = piece.c === 0 ? -1 : 1;
                if (dc === 0 && dr === dir && !target) return true;
                if (adc === 1 && dr === dir && target) return true;
                return false;
            }
            case 'R': return (dr === 0 || dc === 0) && pathClear(fr, fc, tr, tc, b);
            case 'B': return adr === adc && pathClear(fr, fc, tr, tc, b);
            case 'Q': return (dr === 0 || dc === 0 || adr === adc) && pathClear(fr, fc, tr, tc, b);
            case 'K': return adr <= 1 && adc <= 1;
            case 'N': return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
            default: return false;
        }
    };

    const pathClear = (fr, fc, tr, tc, b) => {
        const dr = Math.sign(tr - fr), dc = Math.sign(tc - fc);
        let r = fr + dr, c = fc + dc;
        while (r !== tr || c !== tc) { if (b[r][c]) return false; r += dr; c += dc; }
        return true;
    };

    const handleClick = (r, c) => {
        if (winner) return;
        if (selected) {
            if (selected[0] === r && selected[1] === c) { setSelected(null); return; }
            if (isValidMove(selected[0], selected[1], r, c, board)) {
                const b = board.map(row => row.map(cell => cell ? { ...cell } : null));
                const captured = b[r][c];
                b[r][c] = b[selected[0]][selected[1]];
                b[selected[0]][selected[1]] = null;
                // Pawn promotion
                if (b[r][c].t === 'P' && (r === 0 || r === SIZE - 1)) b[r][c].t = 'Q';
                setBoard(b); setSelected(null);
                if (captured && captured.t === 'K') {
                    setWinner(turn === 0 ? 'White' : 'Black'); setPhase('end'); onScoreUpdate?.(1);
                } else setTurn(1 - turn);
            } else setSelected(null);
        } else {
            if (board[r][c] && board[r][c].c === turn) setSelected([r, c]);
        }
    };

    const isLight = (r, c) => (r + c) % 2 === 0;
    const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>♟️</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Chess Lite</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Simplified 6x6 chess! Capture the King to win.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase !== 'menu' && (
                <div style={{ textAlign: 'center' }}>
                    {!winner && <p style={{ fontFamily: 'Orbitron', fontSize: '.9rem', color: turn === 0 ? '#fff' : '#B8C1EC', marginBottom: 8 }}>{turn === 0 ? 'White' : 'Black'}'s Turn</p>}
                    {winner && <p style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#FFD93D', marginBottom: 8 }}>🏆 {winner} Wins!</p>}
                    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 0, borderRadius: 8, overflow: 'hidden', border: '2px solid #555' }}>
                        {board.map((row, r) => row.map((cell, c) => (
                            <div key={`${r}-${c}`} onClick={() => handleClick(r, c)} style={{
                                width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isSelected(r, c) ? '#FFD93D55' : isLight(r, c) ? '#b58863' : '#f0d9b5',
                                cursor: 'pointer', fontSize: '2rem',
                                boxShadow: isSelected(r, c) ? 'inset 0 0 0 3px #FFD93D' : 'none'
                            }}>
                                {cell ? (cell.c === 0 ? PIECES[cell.t] : PIECES[cell.t.toLowerCase()]) : ''}
                            </div>
                        )))}
                    </div>
                    {winner && <div style={{ marginTop: 16 }}><button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button></div>}
                </div>
            )}
        </div>
    );
}
