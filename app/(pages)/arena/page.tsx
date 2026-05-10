'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Flag, Handshake, History } from 'lucide-react';

import ChessBoard from '@/components/chessboard';
import { COMMUNICATION_MSG } from '@/lib/constants';
import useWebSocket from 'react-use-websocket';
import { useAuth } from '@/store/context/AuthContenxt';
import { GameResult, ServerMessage } from '@/app/types/area_types';

const Arena = () => {
    const { user } = useAuth();

    const [game, setGame] = useState(new Chess());
    const gameRef = useRef(game);

    const [gameId, setGameId] = useState<string | null>(null);
    const [inQueue, setInQueue] = useState(false);
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
    const [moves, setMoves] = useState<string[]>([]);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

    const userRef = useRef(user);
    const playerColorRef = useRef<'white' | 'black'>('white');
    const gameResultRef = useRef<GameResult | null>(null);
    const updateGameRef = useRef<((sq: string, tq: string, p: string) => boolean) | null>(null);

    const { sendJsonMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL + '/game-ws', {
        shouldReconnect: () => true,
        onOpen: () => {
            const u = userRef.current;
            if (u?._id) {
                setInQueue(true);
                sendJsonMessage({ type: COMMUNICATION_MSG.Init, player_id: u._id });
            }
        },
        onMessage: (event) => {
            let msg: ServerMessage;
            try {
                msg = JSON.parse(event.data as string) as ServerMessage;
            } catch {
                return;
            }

            if ('game_status' in msg && msg.game_status === 'OnGoing') {
                setGameId(msg.id);
                setInQueue(false);
                setPlayerColor(msg.black === userRef.current?._id ? 'black' : 'white');
                setMoves([]);
                setGameResult(null);
                setGame(new Chess(msg.fen));
            } else if ('type' in msg) {
                if (msg.type === 'Matched') {
                    setGameId(msg.game_id);
                    setInQueue(false);
                    setMoves([]);
                    setGameResult(null);
                } else if (msg.type === 'Waiting') {
                    setInQueue(true);
                } else if (msg.type === 'Move') {
                    updateGameRef.current?.(msg.from, msg.to, 'q');
                } else if (msg.type === 'Ended' && !gameResultRef.current) {
                    handleGameEnd({
                        winner: playerColorRef.current,
                        reason: 'Opponent resigned',
                    });
                }
            }
        },
        onClose: (e) => console.log('CLOSE', e),
        onError: (e) => console.log('ERROR', e),
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    const handleGameEnd = useCallback((result: GameResult) => {
        setGameResult(result);
    }, [gameId]);

    const updateGame = useCallback(
        (sq: string, tq: string, p: string) => {
            const currentGame = gameRef.current;
            const move = currentGame.move({ from: sq, to: tq, promotion: p });
            if (move === null) return false;

            setMoves((prev) => [...prev, move.san]);
            setGame(new Chess(currentGame.fen()));

            if (currentGame.isCheckmate()) {
                const winner = currentGame.turn() === 'w' ? 'black' : 'white';
                handleGameEnd({ winner, reason: 'Checkmate' });
            } else if (currentGame.isStalemate()) {
                handleGameEnd({ winner: 'draw', reason: 'Stalemate' });
            } else if (currentGame.isInsufficientMaterial()) {
                handleGameEnd({ winner: 'draw', reason: 'Insufficient Material' });
            } else if (currentGame.isThreefoldRepetition()) {
                handleGameEnd({ winner: 'draw', reason: 'Threefold Repetition' });
            }

            return true;
        },
        [handleGameEnd],
    );

    const onDrop = useCallback(
        ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }) => {
            updateGame(sourceSquare, targetSquare, 'q');
            const uid = userRef.current?._id;
            if (gameId && uid) {
                sendJsonMessage({
                    game_id: gameId,
                    player_id: uid,
                    from: sourceSquare,
                    to: targetSquare,
                    type: 'Move',
                });
            }
            return true;
        },
        [gameId, updateGame, sendJsonMessage],
    );

    const handleResign = useCallback(() => {
        if (!gameId || gameResult) return;
        sendJsonMessage({ type: 'END', game_id: gameId });
        const winner = playerColor === 'white' ? 'black' : 'white';
        handleGameEnd({ winner, reason: 'Resignation' });
    }, [gameId, gameResult, playerColor, handleGameEnd, sendJsonMessage]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);
    useEffect(() => {
        playerColorRef.current = playerColor;
    }, [playerColor]);
    useEffect(() => {
        gameResultRef.current = gameResult;
    }, [gameResult]);
    useEffect(() => {
        updateGameRef.current = updateGame;
    }, [updateGame]);

    return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-[#09090b]">
            <aside className="relative z-10 flex h-full w-56 shrink-0 flex-col border-r border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
                <div className="border-b border-zinc-800/40 p-4">
                    <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                        Opponent
                    </p>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800 text-xs text-zinc-400">
                            ?
                        </div>
                        <div>
                            <p className="text-sm leading-none font-medium text-zinc-200">
                                Anonymous
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 capitalize">
                                {playerColor === 'white' ? 'Black' : 'White'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-3 flex items-center gap-1.5">
                        <History size={12} className="text-zinc-600" />
                        <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                            Moves
                        </p>
                    </div>
                    {moves.length === 0 ? (
                        <p className="text-xs text-zinc-700 italic">No moves yet</p>
                    ) : (
                        <div className="space-y-0.5 font-mono text-xs">
                            {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="w-5 text-zinc-600">{i + 1}.</span>
                                    <span className="text-zinc-300">{moves[i * 2]}</span>
                                    {moves[i * 2 + 1] && (
                                        <span className="text-zinc-500">{moves[i * 2 + 1]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t border-zinc-800/40 p-4">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/30 hover:text-zinc-200">
                        <Handshake size={13} />
                        Offer Draw
                    </button>
                    <button
                        onClick={handleResign}
                        disabled={!gameId || !!gameResult}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Flag size={13} />
                        Resign
                    </button>
                </div>

                <div className="border-t border-zinc-800/40 p-4">
                    <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                        You
                    </p>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/20 text-xs font-medium text-indigo-300">
                            {user?._id?.substring(0, 2).toUpperCase() ?? 'ME'}
                        </div>
                        <div>
                            <p className="text-sm leading-none font-medium text-zinc-200">You</p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 capitalize">
                                {playerColor}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="relative z-10 flex flex-1 items-center justify-center">
                {(!gameId || inQueue) && !gameResult && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-[6px]">
                        <div className="pointer-events-none absolute h-[200%] w-[200%] animate-[spin_10s_linear_infinite] bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10 blur-[60px]" />
                        <div className="relative z-10 flex flex-col items-center gap-6 p-8">
                            <div className="relative">
                                <div className="absolute inset-0 -top-2 -left-2 h-20 w-20 animate-spin rounded-full border-t-2 border-r-2 border-emerald-400 border-transparent opacity-80" />
                                <div className="absolute inset-2 top-0 left-0 h-12 w-12 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-b-2 border-l-2 border-blue-400 border-transparent opacity-80" />
                                <div className="flex h-16 w-16 items-center justify-center text-zinc-300">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-80"
                                    >
                                        <path d="M12 21v-4" />
                                        <path d="m15 17 3 4" />
                                        <path d="m9 17-3 4" />
                                        <path d="M12 3a2 2 0 0 0-2 2c0 1.11.89 2 2 2s2-.89 2-2a2 2 0 0 0-2-2Z" />
                                        <path d="M15.5 13H8.5c-.83 0-1.5-1.12-1.5-2.5s.67-2.5 1.5-2.5h7c.83 0 1.5 1.12 1.5 2.5s-.67 2.5-1.5 2.5Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-3 text-center">
                                <h2 className="bg-white from-emerald-200 to-blue-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                                    Finding Opponent
                                </h2>
                                <p className="text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">
                                    Matchmaking in progress
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="h-1 w-1 animate-[bounce_1s_infinite_-0.3s] rounded-full bg-gray-400/80" />
                                <div className="h-1 w-1 animate-[bounce_1s_infinite_-0.15s] rounded-full bg-gray-400/80" />
                                <div className="h-1 w-1 animate-[bounce_1s_infinite_0s] rounded-full bg-gray-400/80" />
                            </div>
                        </div>
                    </div>
                )}

                {gameResult && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[6px]">
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-10 text-center shadow-2xl">
                            <p className="text-4xl font-bold text-white">
                                {gameResult.winner === 'draw'
                                    ? 'Draw'
                                    : gameResult.winner === playerColor
                                      ? 'You won'
                                      : 'You lost'}
                            </p>
                            <p className="text-sm text-zinc-400">{gameResult.reason}</p>
                            <button
                                onClick={() => {
                                    setGameResult(null);
                                    setGameId(null);
                                    setInQueue(false);
                                    setMoves([]);
                                    gameRef.current = new Chess();
                                    setGame(new Chess());
                                }}
                                className="mt-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                            >
                                Play again
                            </button>
                        </div>
                    </div>
                )}

                <div
                    className={`overflow-hidden rounded-sm border border-zinc-800/50 shadow-2xl transition-all duration-1000 ease-in-out ${!gameId || inQueue ? 'scale-[0.98] opacity-20 blur-[4px] saturate-50' : 'scale-100 opacity-100'}`}
                    style={{
                        width: '500px',
                        height: '500px',
                        pointerEvents: gameId && !gameResult ? 'auto' : 'none',
                    }}
                >
                    <ChessBoard
                        options={{
                            position: game.fen(),
                            onPieceDrop: onDrop,
                            boardOrientation: playerColor,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Arena;
