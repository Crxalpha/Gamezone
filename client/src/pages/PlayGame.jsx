import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById, saveProgress, getGameProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Sports (10)
import PingPong from '../games/PingPong';
import AirHockey from '../games/AirHockey';
import Pool from '../games/Pool';
import PenaltyKicks from '../games/PenaltyKicks';
import MiniGolf from '../games/MiniGolf';
import ArcheryDuel from '../games/ArcheryDuel';
import BasketballFlick from '../games/BasketballFlick';
import Bowling from '../games/Bowling';
import Boxing from '../games/Boxing';
import Darts from '../games/Darts';
// Arcade (10)
import SpinnerWar from '../games/SpinnerWar';
import SumoPush from '../games/SumoPush';
import TapRace from '../games/TapRace';
import ReactionTap from '../games/ReactionTap';
import WhackAMole from '../games/WhackAMole';
import DodgeBlocks from '../games/DodgeBlocks';
import KnifeHit from '../games/KnifeHit';
import BalloonPop from '../games/BalloonPop';
import FallingTiles from '../games/FallingTiles';
import QuickAim from '../games/QuickAim';
// Puzzle / Brain (10)
import TicTacToe from '../games/TicTacToe';
import Connect4 from '../games/Connect4';
import MemoryCards from '../games/MemoryGame';
import SimonSays from '../games/SimonSays';
import NumberMatch from '../games/NumberMatch';
import QuickMath from '../games/QuickMathBattle';
import WordGuess from '../games/WordGuess';
import ChessLite from '../games/ChessLite';
import BackgammonLite from '../games/BackgammonLite';
import LudoLite from '../games/LudoLite';

const COMPS = {
    PingPong, AirHockey, Pool, PenaltyKicks, MiniGolf, ArcheryDuel, BasketballFlick, Bowling, Boxing, Darts,
    SpinnerWar, SumoPush, TapRace, ReactionTap, WhackAMole, DodgeBlocks, KnifeHit, BalloonPop, FallingTiles, QuickAim,
    TicTacToe, Connect4, MemoryCards, SimonSays, NumberMatch, QuickMath, WordGuess, ChessLite, BackgammonLite, LudoLite,
    // Legacy mappings
    SnakeGame: null, MemoryGame: MemoryCards, ReactionTime: ReactionTap, QuizSprint: null,
    PongDuel: PingPong, FourCornerBattle: ReactionTap, QuickMathBattle: QuickMath,
};

export default function PlayGame() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [time, setTime] = useState(0);
    const timeRef = useRef(0);
    const timerRef = useRef(null);
    const autoRef = useRef(null);

    useEffect(() => {
        getGameById(id).then(r => setGame(r.data)).catch(() => { }).finally(() => setLoading(false));
        if (user) getGameProgress(id).then(r => { if (r.data?.lastScore) setScore(r.data.lastScore); if (r.data?.level) setLevel(r.data.level); }).catch(() => { });
        timerRef.current = setInterval(() => { timeRef.current += 1; setTime(timeRef.current); }, 1000);
        return () => { clearInterval(timerRef.current); clearInterval(autoRef.current); };
    }, [id, user]);

    useEffect(() => {
        if (user && game) {
            autoRef.current = setInterval(() => {
                saveProgress({ gameId: id, score, level, timePlayed: 20 }).catch(() => { });
            }, 20000);
        }
        return () => clearInterval(autoRef.current);
    }, [user, game, score, level, id]);

    const handleScore = useCallback((s, l) => {
        setScore(s);
        if (l) setLevel(l);
        if (user) saveProgress({ gameId: id, score: s, level: l || level, timePlayed: timeRef.current }).catch(() => { });
    }, [user, id, level]);

    const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="play-page"><div className="loader"><div className="loader-spinner" /><span className="loader-text">Loading...</span></div></div>;
    if (!game) return <div className="play-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem' }}>😢</div><h3>Not Found</h3></div></div>;

    const Comp = COMPS[game.component];

    return (
        <div className="play-page">
            <div className="play-hud">
                <button type="button" className="back-btn" onClick={() => navigate(`/game/${id}`)}>← Back</button>
                <span className="g-title">{game.title}</span>
                <div className="hud-stats">
                    <div className="hud-stat"><div><div className="h-label">Score</div><div className="h-val">{score.toLocaleString()}</div></div></div>
                    <div className="hud-stat"><div><div className="h-label">Level</div><div className="h-val">{level}</div></div></div>
                    <div className="hud-stat"><div><div className="h-label">Time</div><div className="h-val">{fmt(time)}</div></div></div>
                    {user && <div className="hud-stat" style={{ borderColor: 'rgba(6,214,160,.3)' }}><div><div className="h-label" style={{ color: 'var(--cyan)' }}>Save</div><div className="h-val" style={{ color: 'var(--cyan)', fontSize: '.8rem' }}>● ON</div></div></div>}
                </div>
            </div>
            <div className="game-frame">
                <div className="game-wrap">
                    {Comp ? <Comp onScoreUpdate={handleScore} /> : (
                        <div className="game-na">
                            <div className="ico">🚧</div>
                            <h3>Coming Soon</h3>
                            <p>{game.title} is under development.</p>
                            <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/games')}>Browse Games</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
