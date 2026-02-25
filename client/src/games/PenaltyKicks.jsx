import { useState, useCallback } from 'react';

const ZONES = ['TopLeft', 'TopCenter', 'TopRight', 'BottomLeft', 'BottomCenter', 'BottomRight'];
const ROUNDS = 5;
const POS = { TopLeft: { left: '10%', top: '15%' }, TopCenter: { left: '38%', top: '10%' }, TopRight: { left: '66%', top: '15%' }, BottomLeft: { left: '10%', top: '55%' }, BottomCenter: { left: '38%', top: '55%' }, BottomRight: { left: '66%', top: '55%' } };

export default function PenaltyKicks({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [round, setRound] = useState(0);
    const [isShooter, setIsShooter] = useState(true);
    const [scores, setScores] = useState([0, 0]);
    const [shooterChoice, setShooterChoice] = useState(null);
    const [keeperChoice, setKeeperChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(0);

    const reset = useCallback(() => {
        setRound(0); setScores([0, 0]); setShooterChoice(null); setKeeperChoice(null);
        setResult(null); setCurrentPlayer(0); setIsShooter(true); setPhase('play');
    }, []);

    const handleZoneClick = (zone) => {
        if (result) return;
        if (isShooter) {
            setShooterChoice(zone); setIsShooter(false);
        } else {
            setKeeperChoice(zone);
            const goal = zone !== shooterChoice;
            const newScores = [...scores];
            if (goal) newScores[currentPlayer]++;
            setScores(newScores); setResult(goal ? 'GOAL! ⚽' : 'SAVED! 🧤');

            setTimeout(() => {
                const nextPlayer = 1 - currentPlayer;
                const nextRound = nextPlayer === 0 ? round + 1 : round;
                if (nextRound >= ROUNDS) {
                    setPhase('end'); onScoreUpdate?.(Math.max(newScores[0], newScores[1]));
                } else {
                    setRound(nextRound); setCurrentPlayer(nextPlayer);
                    setShooterChoice(null); setKeeperChoice(null); setResult(null); setIsShooter(true);
                }
            }, 1500);
        }
    };

    const zoneStyle = (zone) => ({
        position: 'absolute', ...POS[zone], width: '26%', height: '35%', borderRadius: 12,
        background: isShooter ? 'rgba(255,107,107,0.2)' : 'rgba(77,150,255,0.2)',
        border: `2px solid ${isShooter ? '#FF6B6B55' : '#4D96FF55'}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.75rem', color: '#B8C1EC', fontFamily: 'Orbitron', transition: 'all .2s'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚽</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Penalty Kicks</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>{ROUNDS} rounds each. Shooter picks zone, then keeper guesses!</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>Same device: take turns, no peeking!</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Orbitron', fontSize: '.9rem' }}>
                        <span style={{ color: '#FF6B6B' }}>P1: {scores[0]}</span>
                        <span style={{ color: '#B8C1EC' }}>Round {round + 1}/{ROUNDS}</span>
                        <span style={{ color: '#4D96FF' }}>P2: {scores[1]}</span>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 12, color: '#FFD93D', fontFamily: 'Orbitron', fontSize: '.85rem' }}>
                        Player {currentPlayer + 1}: {isShooter ? '🎯 Pick where to SHOOT' : '🧤 Pick where to DIVE'}
                    </div>
                    {result && <div style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'Orbitron', color: result.includes('GOAL') ? '#6BCB77' : '#FF6B6B', marginBottom: 8 }}>{result}</div>}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '60%', background: 'linear-gradient(180deg, #1a8a3a 0%, #136e2e 100%)', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '5%', left: '5%', right: '5%', bottom: '5%', border: '3px solid #fff4', borderRadius: 8 }}>
                            {ZONES.map(z => (
                                <div key={z} style={zoneStyle(z)} onClick={() => handleZoneClick(z)}
                                    onMouseEnter={e => { e.target.style.background = isShooter ? 'rgba(255,107,107,0.5)' : 'rgba(77,150,255,0.5)'; }}
                                    onMouseLeave={e => { e.target.style.background = isShooter ? 'rgba(255,107,107,0.2)' : 'rgba(77,150,255,0.2)'; }}>
                                    {z.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D', marginBottom: 8 }}>
                        🏆 {scores[0] > scores[1] ? 'Player 1' : scores[1] > scores[0] ? 'Player 2' : 'Nobody'} Wins!
                    </h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 16 }}>{scores[0]} – {scores[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
