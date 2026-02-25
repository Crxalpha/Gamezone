import { useState, useCallback } from 'react';

const POINTS = 24;
const COLORS = ['#FF6B6B', '#4D96FF'];

const initBoard = () => {
    const b = Array(POINTS).fill(null).map(() => ({ pieces: [], color: -1 }));
    // Simplified starting positions
    b[0] = { pieces: [1, 1], color: 1 }; b[5] = { pieces: [0, 0, 0], color: 0 };
    b[7] = { pieces: [0, 0], color: 0 }; b[11] = { pieces: [1, 1, 1], color: 1 };
    b[12] = { pieces: [0, 0, 0], color: 0 }; b[16] = { pieces: [1, 1], color: 1 };
    b[18] = { pieces: [1, 1, 1], color: 1 }; b[23] = { pieces: [0, 0], color: 0 };
    return b;
};

export default function BackgammonLite({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [board, setBoard] = useState(initBoard());
    const [turn, setTurn] = useState(0);
    const [dice, setDice] = useState([0, 0]);
    const [rolled, setRolled] = useState(false);
    const [movesLeft, setMovesLeft] = useState([]);
    const [selected, setSelected] = useState(null);
    const [borne, setBorne] = useState([0, 0]);

    const reset = useCallback(() => {
        setBoard(initBoard()); setTurn(0); setDice([0, 0]); setRolled(false);
        setMovesLeft([]); setSelected(null); setBorne([0, 0]); setPhase('play');
    }, []);

    const roll = () => {
        const d1 = Math.ceil(Math.random() * 6), d2 = Math.ceil(Math.random() * 6);
        setDice([d1, d2]); setRolled(true);
        setMovesLeft(d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]);
    };

    const canMove = (from, steps) => {
        const dir = turn === 0 ? 1 : -1;
        const to = from + dir * steps;
        if (to < 0 || to >= POINTS) return borne[turn] >= 12; // bearing off
        const target = board[to];
        return !target.pieces.length || target.color === turn || target.pieces.length === 1;
    };

    const makeMove = (from, steps) => {
        if (!canMove(from, steps)) return;
        const b = board.map(p => ({ ...p, pieces: [...p.pieces] }));
        const dir = turn === 0 ? 1 : -1;
        const to = from + dir * steps;

        b[from].pieces.pop();
        if (!b[from].pieces.length) b[from].color = -1;

        if (to >= 0 && to < POINTS) {
            if (b[to].pieces.length === 1 && b[to].color !== turn) {
                b[to].pieces = []; // captured (simplified)
            }
            b[to].pieces.push(turn); b[to].color = turn;
        } else {
            const nb = [...borne]; nb[turn]++; setBorne(nb);
            if (nb[turn] >= 10) { setPhase('end'); onScoreUpdate?.(1); return; }
        }

        setBoard(b); setSelected(null);
        const ml = [...movesLeft]; ml.splice(ml.indexOf(steps), 1); setMovesLeft(ml);
        if (ml.length === 0) { setTurn(1 - turn); setRolled(false); }
    };

    const handlePoint = (i) => {
        if (!rolled || !movesLeft.length) return;
        if (selected === null) {
            if (board[i].pieces.length && board[i].color === turn) setSelected(i);
        } else {
            const diff = Math.abs(i - selected);
            if (movesLeft.includes(diff) && canMove(selected, turn === 0 ? diff : diff)) {
                makeMove(selected, diff);
            } else setSelected(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎲</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Backgammon Lite</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Roll dice, move pieces, bear off first!</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center', maxWidth: 600, width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'Orbitron', fontSize: '.85rem' }}>
                        <span style={{ color: COLORS[0] }}>P1 Off: {borne[0]}</span>
                        <span style={{ color: COLORS[turn] }}>Player {turn + 1}'s turn</span>
                        <span style={{ color: COLORS[1] }}>P2 Off: {borne[1]}</span>
                    </div>
                    {/* Simplified board */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', background: '#2a1a0a', padding: 8, borderRadius: 12 }}>
                        {board.slice(0, 12).map((p, i) => (
                            <div key={i} onClick={() => handlePoint(i)} style={{
                                width: 38, height: 60, background: selected === i ? '#FFD93D33' : i % 2 === 0 ? '#4a3020' : '#6a5040',
                                borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                                cursor: 'pointer', padding: 2, gap: 1, border: selected === i ? '2px solid #FFD93D' : '1px solid #3a2a1a'
                            }}>
                                {p.pieces.slice(0, 4).map((_, j) => (
                                    <div key={j} style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS[p.color] }} />
                                ))}
                                {p.pieces.length > 4 && <span style={{ fontSize: '.6rem', color: '#fff' }}>+{p.pieces.length - 4}</span>}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', background: '#2a1a0a', padding: 8, borderRadius: 12, marginTop: 4 }}>
                        {board.slice(12, 24).reverse().map((p, i) => (
                            <div key={i + 12} onClick={() => handlePoint(23 - i)} style={{
                                width: 38, height: 60, background: selected === 23 - i ? '#FFD93D33' : (23 - i) % 2 === 0 ? '#4a3020' : '#6a5040',
                                borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                                cursor: 'pointer', padding: 2, gap: 1, border: selected === 23 - i ? '2px solid #FFD93D' : '1px solid #3a2a1a'
                            }}>
                                {p.pieces.slice(0, 4).map((_, j) => (
                                    <div key={j} style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS[p.color] }} />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        {!rolled ? (
                            <button type="button" onClick={roll} className="btn btn-primary">🎲 ROLL DICE</button>
                        ) : (
                            <div>
                                <p style={{ fontFamily: 'Orbitron', color: '#FFD93D', fontSize: '1.2rem' }}>🎲 {dice[0]} + {dice[1]}</p>
                                <p style={{ color: '#B8C1EC', fontSize: '.8rem' }}>Moves: {movesLeft.join(', ') || 'none'}</p>
                                {movesLeft.length === 0 && <button type="button" onClick={() => { setTurn(1 - turn); setRolled(false); }} className="btn btn-secondary" style={{ marginTop: 8 }}>End Turn</button>}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 Player {turn + 1} Wins!</h3>
                    <button type="button" onClick={reset} className="btn btn-primary" style={{ marginTop: 12 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
