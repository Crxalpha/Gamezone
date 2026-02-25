import { useState, useCallback } from 'react';

const COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D'];
const BOARD_SIZE = 28; // Simplified path(7 per side)
const HOME_STRETCH = 4;

export default function LudoLite({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [playerCount, setPlayerCount] = useState(2);
    const [positions, setPositions] = useState([]); // Each player: [token1pos, token2pos]
    const [turn, setTurn] = useState(0);
    const [dice, setDice] = useState(0);
    const [rolled, setRolled] = useState(false);
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => {
        const pos = Array.from({ length: playerCount }, () => [-1, -1]); // -1 = at base
        setPositions(pos); setTurn(0); setDice(0); setRolled(false); setWinner(null); setPhase('play');
    }, [playerCount]);

    const roll = () => {
        const d = Math.ceil(Math.random() * 6);
        setDice(d); setRolled(true);
    };

    const moveToken = (tokenIdx) => {
        if (!rolled) return;
        const pos = positions.map(p => [...p]);
        const current = pos[turn][tokenIdx];

        if (current === -1) {
            if (dice === 6) { pos[turn][tokenIdx] = turn * 7; } // Enter board on 6
            else { endTurn(); return; }
        } else {
            let newPos = current + dice;
            // Check if reached home (simplified: after going around full board)
            if (newPos >= BOARD_SIZE + HOME_STRETCH) {
                pos[turn][tokenIdx] = 999; // HOME!
                if (pos[turn].every(p => p === 999)) {
                    setWinner(`Player ${turn + 1}`); setPhase('end');
                    onScoreUpdate?.(1); setPositions(pos); return;
                }
            } else { pos[turn][tokenIdx] = newPos % BOARD_SIZE; }
        }
        setPositions(pos); endTurn();
    };

    const endTurn = () => {
        setRolled(false);
        if (dice !== 6) setTurn(t => (t + 1) % playerCount);
    };

    const getTokenDisplay = (pos) => {
        if (pos === -1) return '🏠 Base';
        if (pos === 999) return '🏁 Home!';
        return `Square ${pos}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎲</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Ludo Lite</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>Race your tokens around the board! Roll 6 to enter.</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                        {[2, 3, 4].map(n => (
                            <button type="button" key={n} onClick={() => setPlayerCount(n)} style={{
                                padding: '8px 16px', borderRadius: 12, fontFamily: 'Orbitron', fontSize: '.8rem',
                                background: playerCount === n ? COLORS[n - 2] : '#1B1E3F', color: '#fff',
                                border: `2px solid ${playerCount === n ? COLORS[n - 2] : '#333'}`, cursor: 'pointer'
                            }}>{n}P</button>
                        ))}
                    </div>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
                    <p style={{ fontFamily: 'Orbitron', fontSize: '.9rem', color: COLORS[turn], marginBottom: 12 }}>Player {turn + 1}'s Turn</p>
                    {/* Simple visual board */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 16, padding: 12, background: '#1B1E3F', borderRadius: 16 }}>
                        {Array.from({ length: BOARD_SIZE }).map((_, i) => {
                            const tokensHere = [];
                            positions.forEach((p, pi) => p.forEach((t, ti) => { if (t === i) tokensHere.push(pi); }));
                            return (
                                <div key={i} style={{
                                    width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: tokensHere.length ? COLORS[tokensHere[0]] + '44' : '#0a0d1f',
                                    border: `1px solid ${i % 7 === 0 ? COLORS[Math.floor(i / 7)] + '88' : '#333'}`,
                                    fontSize: '.6rem', color: '#fff', position: 'relative'
                                }}>
                                    {tokensHere.map(pi => (
                                        <div key={pi} style={{
                                            width: 12, height: 12, borderRadius: '50%', background: COLORS[pi],
                                            border: '1px solid #fff', position: 'absolute'
                                        }} />
                                    ))}
                                    {!tokensHere.length && <span style={{ color: '#444' }}>{i}</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Player tokens */}
                    {positions.map((tokens, pi) => (
                        <div key={pi} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8, opacity: pi === turn ? 1 : 0.5 }}>
                            <span style={{ color: COLORS[pi], fontFamily: 'Orbitron', fontSize: '.75rem', width: 30 }}>P{pi + 1}</span>
                            {tokens.map((t, ti) => (
                                <button type="button" key={ti} onClick={() => pi === turn && moveToken(ti)}
                                    disabled={pi !== turn || !rolled} style={{
                                        padding: '6px 12px', borderRadius: 8, fontSize: '.7rem', fontFamily: 'Poppins',
                                        background: COLORS[pi] + '33', border: `1px solid ${COLORS[pi]}`, color: '#fff',
                                        cursor: pi === turn && rolled ? 'pointer' : 'default'
                                    }}>
                                    {t === -1 ? '🏠' : t === 999 ? '🏁' : `📍${t}`}
                                </button>
                            ))}
                        </div>
                    ))}

                    <div style={{ marginTop: 12 }}>
                        {!rolled ? (
                            <button type="button" onClick={roll} className="btn btn-primary">🎲 ROLL DICE</button>
                        ) : (
                            <p style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: '#FFD93D' }}>🎲 {dice} {dice === 6 ? '🎉' : ''}</p>
                        )}
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {winner} Wins!</h3>
                    <button type="button" onClick={() => setPhase('menu')} className="btn btn-primary" style={{ marginTop: 12 }}>PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
