import { useState, useEffect, useCallback } from 'react';

const MAX_HP = 100, ROUNDS = 3;

export default function Boxing({ onScoreUpdate }) {
    const [phase, setPhase] = useState('menu');
    const [hp, setHp] = useState([MAX_HP, MAX_HP]);
    const [round, setRound] = useState(1);
    const [roundWins, setRoundWins] = useState([0, 0]);
    const [actions, setActions] = useState([null, null]);
    const [msg, setMsg] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [winner, setWinner] = useState(null);

    const reset = useCallback(() => {
        setHp([MAX_HP, MAX_HP]); setRound(1); setRoundWins([0, 0]);
        setActions([null, null]); setMsg(''); setCountdown(0); setWinner(null); setPhase('play');
    }, []);

    useEffect(() => {
        if (phase !== 'play') return;
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if ((k === 'a' || k === 's') && !actions[0]) {
                setActions(prev => { const n = [...prev]; n[0] = k === 'a' ? 'punch' : 'block'; return n; });
            }
            if ((k === 'k' || k === 'l') && !actions[1]) {
                setActions(prev => { const n = [...prev]; n[1] = k === 'k' ? 'punch' : 'block'; return n; });
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, actions]);

    useEffect(() => {
        if (phase !== 'play' || !actions[0] || !actions[1]) return;
        const [a1, a2] = actions;
        let dmg1 = 0, dmg2 = 0;
        if (a1 === 'punch' && a2 !== 'block') dmg2 = 15 + Math.floor(Math.random() * 10);
        if (a2 === 'punch' && a1 !== 'block') dmg1 = 15 + Math.floor(Math.random() * 10);
        if (a1 === 'punch' && a2 === 'block') dmg2 = 3;
        if (a2 === 'punch' && a1 === 'block') dmg1 = 3;

        const newHp = [Math.max(0, hp[0] - dmg1), Math.max(0, hp[1] - dmg2)];
        setHp(newHp);

        let m = '';
        if (a1 === 'punch' && a2 === 'punch') m = 'Both punch! 💥';
        else if (a1 === 'punch' && a2 === 'block') m = 'P1 punches, P2 blocks! 🛡️';
        else if (a1 === 'block' && a2 === 'punch') m = 'P2 punches, P1 blocks! 🛡️';
        else m = 'Both block... 🤝';
        setMsg(m);

        setTimeout(() => {
            if (newHp[0] <= 0 || newHp[1] <= 0) {
                const rw = [...roundWins];
                if (newHp[1] <= 0) rw[0]++;
                if (newHp[0] <= 0) rw[1]++;
                setRoundWins(rw);
                if (rw[0] >= 2 || rw[1] >= 2 || round >= ROUNDS) {
                    setWinner(rw[0] > rw[1] ? 'Player 1' : rw[1] > rw[0] ? 'Player 2' : 'Draw');
                    setPhase('end'); onScoreUpdate?.(Math.max(rw[0], rw[1]) * 50);
                } else {
                    setRound(r => r + 1); setHp([MAX_HP, MAX_HP]); setMsg(`Round ${round + 1}!`);
                }
            }
            setActions([null, null]);
        }, 1000);
    }, [actions]);

    const hpBar = (val, color) => (
        <div style={{ height: 20, background: '#1B1E3F', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
            <div style={{ width: `${val}%`, height: '100%', background: color, borderRadius: 10, transition: 'width .3s' }} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {phase === 'menu' && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🥊</div>
                    <h2 style={{ fontFamily: 'Orbitron', marginBottom: 8 }}>Boxing</h2>
                    <p style={{ color: '#B8C1EC', marginBottom: 8 }}>Best of {ROUNDS} rounds! Time your punches and blocks.</p>
                    <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 20 }}>P1: A=punch, S=block &nbsp;|&nbsp; P2: K=punch, L=block</p>
                    <button type="button" onClick={reset} className="btn btn-primary">START GAME</button>
                </div>
            )}
            {phase === 'play' && (
                <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '.9rem', color: '#B8C1EC', marginBottom: 8 }}>Round {round}/{ROUNDS} — Wins: {roundWins[0]}-{roundWins[1]}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ color: '#FF6B6B', fontFamily: 'Orbitron', fontSize: '.8rem', width: 30 }}>P1</span>
                        {hpBar(hp[0] / MAX_HP * 100, '#FF6B6B')}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ color: '#4D96FF', fontFamily: 'Orbitron', fontSize: '.8rem', width: 30 }}>P2</span>
                        {hpBar(hp[1] / MAX_HP * 100, '#4D96FF')}
                    </div>
                    <div style={{ fontSize: '4rem', marginBottom: 12 }}>
                        <span style={{ marginRight: 40 }}>{actions[0] === 'punch' ? '👊' : actions[0] === 'block' ? '🛡️' : '🥊'}</span>
                        <span>{actions[1] === 'punch' ? '👊' : actions[1] === 'block' ? '🛡️' : '🥊'}</span>
                    </div>
                    <p style={{ color: '#FFD93D', fontFamily: 'Orbitron', fontSize: '.9rem', minHeight: 28 }}>{msg}</p>
                    <p style={{ color: '#666', fontSize: '.8rem', marginTop: 8 }}>
                        {!actions[0] && 'P1: press A (punch) or S (block)'}{!actions[0] && !actions[1] && ' | '}{!actions[1] && 'P2: press K (punch) or L (block)'}
                    </p>
                </div>
            )}
            {phase === 'end' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#FFD93D' }}>🏆 {winner}!</h3>
                    <p style={{ color: '#B8C1EC', marginBottom: 12 }}>Rounds: {roundWins[0]} – {roundWins[1]}</p>
                    <button type="button" onClick={reset} className="btn btn-primary">PLAY AGAIN</button>
                </div>
            )}
        </div>
    );
}
