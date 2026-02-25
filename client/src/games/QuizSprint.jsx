import { useState, useEffect, useRef } from 'react';

const QUESTIONS = [
    { q: 'What planet is known as the Red Planet?', a: ['Mars', 'Venus', 'Jupiter', 'Saturn'], c: 0 },
    { q: 'What is the largest ocean?', a: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], c: 1 },
    { q: 'How many legs does a spider have?', a: ['6', '8', '10', '12'], c: 1 },
    { q: 'What gas do plants breathe in?', a: ['Oxygen', 'Nitrogen', 'CO2', 'Helium'], c: 2 },
    { q: 'What year did the Titanic sink?', a: ['1905', '1912', '1920', '1898'], c: 1 },
    { q: 'Who painted the Mona Lisa?', a: ['Picasso', 'Da Vinci', 'Van Gogh', 'Monet'], c: 1 },
    { q: 'What is H2O?', a: ['Salt', 'Sugar', 'Water', 'Oil'], c: 2 },
    { q: 'How many continents are there?', a: ['5', '6', '7', '8'], c: 2 },
    { q: 'What is the fastest land animal?', a: ['Lion', 'Cheetah', 'Horse', 'Eagle'], c: 1 },
    { q: 'What does CPU stand for?', a: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], c: 0 },
    { q: 'Which element has symbol "O"?', a: ['Gold', 'Silver', 'Oxygen', 'Osmium'], c: 2 },
    { q: 'What is 15 × 8?', a: ['100', '120', '130', '115'], c: 1 },
    { q: 'Who wrote Romeo and Juliet?', a: ['Dickens', 'Shakespeare', 'Homer', 'Twain'], c: 1 },
    { q: 'What colour do you get mixing red and blue?', a: ['Green', 'Orange', 'Purple', 'Brown'], c: 2 },
    { q: 'How many bones in the adult human body?', a: ['186', '206', '226', '256'], c: 1 },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function QuizSprint({ onScoreUpdate }) {
    const [questions, setQuestions] = useState([]);
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [done, setDone] = useState(false);
    const [timer, setTimer] = useState(15);
    const timerRef = useRef(null);

    const init = () => {
        setQuestions(shuffle(QUESTIONS).slice(0, 10));
        setIdx(0); setScore(0); setSelected(null); setDone(false); setTimer(15);
    };

    useEffect(() => { init(); }, []);

    useEffect(() => {
        if (done || selected !== null) return;
        setTimer(15);
        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) { clearInterval(timerRef.current); next(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [idx, done, selected]);

    const next = () => {
        if (idx >= questions.length - 1) {
            setDone(true);
            onScoreUpdate?.(score, 1);
        } else {
            setIdx(i => i + 1);
            setSelected(null);
        }
    };

    const answer = (i) => {
        if (selected !== null || done) return;
        clearInterval(timerRef.current);
        setSelected(i);
        const correct = i === questions[idx].c;
        if (correct) setScore(s => { const ns = s + 100 + timer * 10; return ns; });
        setTimeout(next, 1200);
    };

    if (questions.length === 0) return <div className="loader"><div className="loader-spinner" /></div>;

    if (done) {
        return (
            <div className="mg">
                <div className="mg-status">🏁 Quiz Complete!</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-head)', background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score} pts</div>
                <div className="mg-scores"><span>Correct: <strong style={{ color: 'var(--cyan)' }}>{Math.round(score / 100)}</strong>/10</span></div>
                <button type="button" className="btn btn-primary" onClick={init}>🔄 Play Again</button>
            </div>
        );
    }

    const cur = questions[idx];

    return (
        <div className="mg">
            <div className="mg-scores">
                <span>Q: <strong>{idx + 1}/10</strong></span>
                <span>Score: <strong style={{ color: 'var(--purple)' }}>{score}</strong></span>
                <span>Timer: <strong style={{ color: timer <= 5 ? 'var(--red)' : 'var(--cyan)' }}>{timer}s</strong></span>
            </div>
            <div className="qm-problem" style={{ fontSize: '1.2rem' }}>{cur.q}</div>
            <div className="qm-answers">
                {cur.a.map((a, i) => (
                    <button type="button" key={i}
                        className={`qm-ans ${selected !== null ? (i === cur.c ? 'correct' : i === selected ? 'wrong' : '') : ''}`}
                        onClick={() => answer(i)} disabled={selected !== null}>
                        {a}
                    </button>
                ))}
            </div>
        </div>
    );
}
