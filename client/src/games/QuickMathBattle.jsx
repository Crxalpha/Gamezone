import { useState, useEffect, useRef, useCallback } from 'react';

const NAMES = ['P1', 'P2', 'P3', 'P4'];
const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f97316'];
const ROUNDS = 8;

function genProblem() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 5; b = Math.floor(Math.random() * 50) + 5; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 30; b = Math.floor(Math.random() * a); ans = a - b; }
    else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; ans = a * b; }

    const choices = new Set([ans]);
    while (choices.size < 4) choices.add(ans + Math.floor(Math.random() * 20) - 10 || ans + choices.size);
    const arr = [...choices].sort(() => Math.random() - .5);
    return { text: `${a} ${op} ${b}`, answer: ans, choices: arr };
}

export default function QuickMathBattle({ onScoreUpdate }) {
    const [state, setState] = useState('idle');
    const [scores, setScores] = useState([0, 0, 0, 0]);
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState(0);
    const [problem, setProblem] = useState(null);
    const [msg, setMsg] = useState('');
    const [answered, setAnswered] = useState(false);
    const timerRef = useRef(null);

    const nextTurn = useCallback(() => {
        if (round >= ROUNDS) {
            setState('over');
            const best = Math.max(...scores);
            const w = scores.indexOf(best);
            setMsg(`🏆 ${NAMES[w]} Wins!`);
            onScoreUpdate?.(best, 1);
            return;
        }
        const p = genProblem();
        setProblem(p);
        setTurn(round % 4);
        setAnswered(false);
        setMsg(`${NAMES[round % 4]}'s turn — solve fast!`);
        timerRef.current = setTimeout(() => {
            if (!answered) {
                setMsg('⏰ Time up!');
                setRound(r => r + 1);
            }
        }, 8000);
    }, [round, scores, onScoreUpdate, answered]);

    const start = () => { setScores([0, 0, 0, 0]); setRound(0); setState('playing'); };

    useEffect(() => {
        if (state === 'playing') nextTurn();
    }, [round, state]);

    const answer = (val) => {
        if (answered || state !== 'playing') return;
        clearTimeout(timerRef.current);
        setAnswered(true);
        if (val === problem.answer) {
            const ns = [...scores]; ns[turn] += 10; setScores(ns);
            setMsg(`✅ ${NAMES[turn]} correct! +10`);
        } else {
            setMsg(`❌ Wrong! Answer was ${problem.answer}`);
        }
        setTimeout(() => setRound(r => r + 1), 1500);
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <div className="mg">
            <div className="mg-status">{state === 'idle' ? '🔢 Quick Math Battle' : msg}</div>
            <div className="mg-scores">
                {NAMES.map((n, i) => (
                    <span key={i} style={{ color: COLORS[i], fontWeight: turn === i && state === 'playing' ? 800 : 400, textDecoration: turn === i && state === 'playing' ? 'underline' : 'none' }}>
                        {n}: <strong>{scores[i]}</strong>
                    </span>
                ))}
            </div>
            {state === 'playing' && !answered && problem && (
                <>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Round {round + 1}/{ROUNDS} — {NAMES[turn]}'s turn</div>
                    <div className="qm-problem">{problem.text} = ?</div>
                    <div className="qm-answers">
                        {problem.choices.map((c, i) => (
                            <button type="button" key={i} className="qm-ans" onClick={() => answer(c)}>{c}</button>
                        ))}
                    </div>
                </>
            )}
            {(state === 'idle' || state === 'over') && (
                <button type="button" className="btn btn-primary" onClick={start}>{state === 'over' ? '🔄 Rematch' : '▶ Start'}</button>
            )}
        </div>
    );
}
