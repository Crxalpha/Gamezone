import { useState, useCallback, useEffect } from 'react';

const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

/* Minimax AI */
function minimax(board, isMax, depth = 0) {
    const res = checkBoard(board);
    if (res === 'O') return 10 - depth;
    if (res === 'X') return depth - 10;
    if (board.every(c => c)) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) { board[i] = 'O'; best = Math.max(best, minimax(board, false, depth + 1)); board[i] = null; }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) { board[i] = 'X'; best = Math.min(best, minimax(board, true, depth + 1)); board[i] = null; }
        }
        return best;
    }
}

function checkBoard(b) {
    for (const [a, c, d] of WINS) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return null;
}

function getBestMove(board) {
    let bestVal = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = 'O';
            const val = minimax(board, false, 0);
            board[i] = null;
            if (val > bestVal) { bestVal = val; bestMove = i; }
        }
    }
    return bestMove;
}

export default function TicTacToe({ onScoreUpdate }) {
    const [mode, setMode] = useState(null); // null=menu, 'friend', 'bot'
    const [board, setBoard] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState('X');
    const [winner, setWinner] = useState(null);
    const [winCells, setWinCells] = useState([]);
    const [score, setScore] = useState({ x: 0, o: 0, d: 0 });

    const check = useCallback((b) => {
        for (const [a, c, d] of WINS) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], cells: [a, c, d] };
        if (b.every(c => c)) return { w: 'draw', cells: [] };
        return null;
    }, []);

    const applyMove = useCallback((nb) => {
        const r = check(nb);
        if (r) {
            setBoard(nb); setWinner(r.w); setWinCells(r.cells);
            const ns = { ...score };
            if (r.w === 'X') { ns.x++; onScoreUpdate?.(ns.x * 100, ns.x); }
            else if (r.w === 'O') { ns.o++; }
            else { ns.d++; }
            setScore(ns);
            return true;
        }
        setBoard(nb);
        return false;
    }, [check, score, onScoreUpdate]);

    const click = (i) => {
        if (board[i] || winner) return;
        if (mode === 'bot' && turn === 'O') return; // AI's turn
        const nb = [...board]; nb[i] = turn;
        const ended = applyMove(nb);
        if (!ended) setTurn(turn === 'X' ? 'O' : 'X');
    };

    // Bot move
    useEffect(() => {
        if (mode !== 'bot' || turn !== 'O' || winner) return;
        const timer = setTimeout(() => {
            const nb = [...board];
            const move = getBestMove(nb);
            if (move >= 0) {
                nb[move] = 'O';
                const ended = applyMove(nb);
                if (!ended) setTurn('X');
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [mode, turn, winner, board, applyMove]);

    const reset = () => { setBoard(Array(9).fill(null)); setTurn('X'); setWinner(null); setWinCells([]); };

    const status = winner === 'X' ? '🎉 X Wins!' : winner === 'O' ? (mode === 'bot' ? '🤖 Bot Wins!' : '🎉 O Wins!') : winner === 'draw' ? '🤝 Draw!' : `${turn === 'X' ? '❌' : '⭕'} ${turn === 'O' && mode === 'bot' ? "Bot's" : turn + "'s"} Turn`;

    if (!mode) {
        return (
            <div className="mg" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>❌⭕</div>
                <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Tic Tac Toe</h2>
                <p style={{ color: '#B8C1EC', marginBottom: 20 }}>Choose your mode</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '0 auto' }}>
                    <button type="button" className="btn btn-primary" onClick={() => setMode('friend')} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '16px 24px', fontSize: '1rem' }}>
                        👤 <span><small style={{ opacity: .7 }}>PLAY VS.</small><br /><strong>FRIEND</strong></span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setMode('bot')} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '16px 24px', fontSize: '1rem', background: 'linear-gradient(135deg, #FF9F1C, #FF6B6B)' }}>
                        🤖 <span><small style={{ opacity: .7 }}>PLAY VS.</small><br /><strong>BOT</strong></span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mg">
            <div className="mg-status">{status}</div>
            <div className="mg-board">
                {board.map((c, i) => (
                    <button type="button" key={i} className={`mg-cell ${c ? 'taken' : ''} ${c === 'X' ? 'x' : c === 'O' ? 'o' : ''} ${winCells.includes(i) ? 'win' : ''}`} onClick={() => click(i)}>{c}</button>
                ))}
            </div>
            <div className="mg-scores">
                <span>{mode === 'bot' ? 'You' : 'X'}: <strong style={{ color: 'var(--purple)' }}>{score.x}</strong></span>
                <span>{mode === 'bot' ? '🤖 Bot' : 'O'}: <strong style={{ color: 'var(--cyan)' }}>{score.o}</strong></span>
                <span>Draw: <strong>{score.d}</strong></span>
            </div>
            <div className="mg-actions">
                <button type="button" className="btn btn-secondary" onClick={reset}>🔄 New Game</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setMode(null); reset(); setScore({ x: 0, o: 0, d: 0 }); }}>← Back</button>
            </div>
        </div>
    );
}
