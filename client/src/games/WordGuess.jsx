import { useState, useCallback } from 'react';

const WORDS = ['REACT', 'GAMES', 'PIXEL', 'SCORE', 'WORLD', 'BRAIN', 'MUSIC', 'LIGHT', 'POWER', 'SPEED', 'MAGIC', 'NINJA', 'QUEST', 'CHASE', 'BLOCK', 'SWING', 'ARENA', 'BLITZ', 'CLASH', 'DRIFT'];
const MAX_WRONG = 6;
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function WordGuess({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [word, setWord] = useState('');
    const [guessed, setGuessed] = useState(new Set());
    const [wrong, setWrong] = useState(0);
    const [won, setWon] = useState(false);

    const reset = useCallback(() => {
        const w = WORDS[Math.floor(Math.random() * WORDS.length)];
        setWord(w); setGuessed(new Set()); setWrong(0); setWon(false); setPhase('play');
    }, []);

    const guess = (letter) => {
        if (guessed.has(letter) || won || wrong >= MAX_WRONG) return;
        const newG = new Set([...guessed, letter]);
        setGuessed(newG);
        if (!word.includes(letter)) {
            const nw = wrong + 1; setWrong(nw);
            if (nw >= MAX_WRONG) { setPhase('end'); onScoreUpdate?.(0); }
        } else {
            const allGuessed = word.split('').every(l => newG.has(l));
            if (allGuessed) { setWon(true); setPhase('end'); onScoreUpdate?.(MAX_WRONG - wrong); }
        }
    };

    const bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Word Guess</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Guess the word letter by letter! Don't run out of tries.</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {(phase === 'play' || (phase === 'end' && word)) && (
                <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
                    {/* Hangman figure */}
                    <svg width="150" height="150" style={{ margin: '0 auto 16px' }}>
                        <line x1="20" y1="140" x2="80" y2="140" stroke="#555" strokeWidth="3" />
                        <line x1="50" y1="140" x2="50" y2="20" stroke="#555" strokeWidth="3" />
                        <line x1="50" y1="20" x2="100" y2="20" stroke="#555" strokeWidth="3" />
                        <line x1="100" y1="20" x2="100" y2="40" stroke="#555" strokeWidth="3" />
                        {wrong >= 1 && <circle cx="100" cy="52" r="12" stroke="#FF6B6B" strokeWidth="2" fill="none" />}
                        {wrong >= 2 && <line x1="100" y1="64" x2="100" y2="100" stroke="#FF6B6B" strokeWidth="2" />}
                        {wrong >= 3 && <line x1="100" y1="74" x2="80" y2="90" stroke="#FF6B6B" strokeWidth="2" />}
                        {wrong >= 4 && <line x1="100" y1="74" x2="120" y2="90" stroke="#FF6B6B" strokeWidth="2" />}
                        {wrong >= 5 && <line x1="100" y1="100" x2="82" y2="125" stroke="#FF6B6B" strokeWidth="2" />}
                        {wrong >= 6 && <line x1="100" y1="100" x2="118" y2="125" stroke="#FF6B6B" strokeWidth="2" />}
                    </svg>

                    {/* Word display */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                        {word.split('').map((l, i) => (
                            <div key={i} style={{
                                width: 40, height: 48, borderBottom: '3px solid #4D96FF', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                fontFamily: 'Orbitron', color: guessed.has(l) ? '#fff' : 'transparent'
                            }}>{guessed.has(l) ? l : '_'}</div>
                        ))}
                    </div>

                    <p style={{ color: '#B8C1EC', fontSize: '.8rem', marginBottom: 12 }}>{MAX_WRONG - wrong} tries remaining</p>

                    {/* Keyboard */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
                        {ALPHA.map(l => (
                            <button type="button" key={l} onClick={() => guess(l)} disabled={guessed.has(l)} style={{
                                width: 36, height: 40, borderRadius: 8, border: 'none', cursor: guessed.has(l) ? 'default' : 'pointer',
                                fontFamily: 'Orbitron', fontSize: '.75rem', fontWeight: 'bold',
                                background: guessed.has(l) ? (word.includes(l) ? '#6BCB77' : '#333') : '#1B1E3F',
                                color: guessed.has(l) ? '#fff' : '#B8C1EC', transition: 'all .15s',
                                opacity: guessed.has(l) ? 0.5 : 1
                            }}>{l}</button>
                        ))}
                    </div>

                    {phase === 'end' && (
                        <div style={{ marginTop: 20 }}>
                            <h3 style={{ fontFamily: 'Orbitron', color: won ? '#6BCB77' : '#FF6B6B', marginBottom: 8 }}>
                                {won ? '🎉 You got it!' : `💀 The word was: ${word}`}
                            </h3>
                            <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
