
"use client";

import { Chess } from "chess.js";
import { useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Handshake, History, Scale } from "lucide-react";

import stockfishService, { EvalInfo } from "@/service/ui/stockfish.service";
import ChessBoard from "@/components/chessboard";
import { Spinner } from "@/components/ui/spinner";
import { CHESS_PIECES_COLOR, MESSAGE_TYPE } from "@/lib/constants";
import LLM from "@/components/LLM";
import { ChatMessage, sendChatMessage, getGameAnalytics, sendGameAnalytics } from "@/service/ui/llm.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/context/AuthContext";

const Arena = () => {
    const [loader, setLoader] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);
    const params = useSearchParams();
    const gameId = params.get("gameId")
    const pathname = usePathname();
    const isVsStockfish = pathname === "/vs-stockfish";
    const { user } = useAuth();

    const [liveJudge, setLiveJudge] = useState(false)
    const liveJudgeRef = useRef(false);
    const [gameOver, setGameOver] = useState(false);
    const gameOverRef = useRef(false);
    const currentPlayerRef = useRef(CHESS_PIECES_COLOR.WHITE);
    const lastEvalRef = useRef<EvalInfo | null>(null);
    const [game, setGame] = useState(new Chess());
    const [moves, setMoves] = useState([])
    const gameRef = useRef(game);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    const { data: analyticsData } = useQuery({
        queryKey: ["game-analytics", gameId, user?._id],
        queryFn: () => getGameAnalytics({ gameId: gameId!, playerId: user!._id }),
        enabled: !!gameId && !!user?._id,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!analyticsData) return;
        setTimeout(() => {
            if (analyticsData?.gameData && Object.keys(analyticsData?.gameData).length) {
                const updatedGame = new Chess(analyticsData?.gameData.fen);
                setGame(updatedGame);
                setMoves(analyticsData?.gameData?.moves || [])
            }
            setMessages((prev) => [
                ...prev,
                { role: MESSAGE_TYPE.MODEL, content: analyticsData?.analysis || analyticsData?.message || "" },
            ]);
            scrollToBottom();
        }, 0);
    }, [analyticsData, scrollToBottom]);

    const chatMutation = useMutation({
        mutationFn: (payload: ChatMessage[]) => sendChatMessage({ messages: payload, currentPlayer: currentPlayerRef.current, currentGame: gameRef.current.fen() }),
        onSuccess: (response) => {
            setMessages((prev: ChatMessage[]) => [
                ...prev,
                { role: MESSAGE_TYPE.MODEL, content: response },
            ]);
            scrollToBottom();
        },
    });

    const gameAnalyticsMutation = useMutation({
        mutationFn: (payload: any) => sendGameAnalytics(payload),
        onSuccess: (response) => {
            setMessages((prev: ChatMessage[]) => [
                ...prev,
                { role: MESSAGE_TYPE.MODEL, content: response },
            ]);
            scrollToBottom();
        },
    });

    const onDrop = useCallback(({ sourceSquare, targetSquare }: any) => {
        if (gameOverRef.current) return false;
        const currentGame = gameRef.current;

        const move = currentGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) return false;

        const updatedGame = new Chess(currentGame.fen());
        setGame(updatedGame);

        stockfishService.evaluatePosition(updatedGame.fen(), 15);

        return true;
    }, []);

    const initializeStockfish = () => {
        stockfishService.init().then(() => {
            setLoader(false);
            stockfishService.newGame();
        }).catch((err) => {
            console.error(err);
            setLoader(false);
        });
    };

    const handleResign = () => {
        if (gameOverRef.current) return;
        gameOverRef.current = true;
        setGameOver(true);
        stockfishService.destroy();
        setMessages((prev) => [
            ...prev,
            { role: MESSAGE_TYPE.MODEL, content: "You resigned. Better luck next time!" },
        ]);
        scrollToBottom();
    };

    const handleReset = () => {
        const newGame = new Chess();
        gameRef.current = newGame;
        setGame(newGame);
        setMoves([]);
        setMessages([]);
        lastEvalRef.current = null;
        gameOverRef.current = false;
        setGameOver(false);
        initializeStockfish();
    };

    useEffect(() => {
        initializeStockfish();

        const unsubscribeEval = stockfishService.onEvaluation((message: EvalInfo) => {
            if (gameOverRef.current) return;
            lastEvalRef.current = message;
            if (currentPlayerRef.current !== gameRef.current.turn()) {
                const currentGame = gameRef.current;
                const bestMove = message.bestMove;

                if (!bestMove || bestMove === "(none)") return;
                const move = currentGame.move({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: bestMove.length > 4 ? bestMove.substring(4) : undefined,
                });

                if (move === null) return;

                setGame(new Chess(currentGame.fen()));

                if (liveJudgeRef.current) {
                    gameAnalyticsMutation.mutate({
                        pv: message.pv,
                        currentPlayer: currentPlayerRef.current,
                        opponentColor: currentPlayerRef.current === CHESS_PIECES_COLOR.WHITE ? CHESS_PIECES_COLOR.BLACK : CHESS_PIECES_COLOR.WHITE,
                        currentGame: gameRef.current.fen(),
                    });
                }
            }
        });

        return () => {
            unsubscribeEval();
            stockfishService.destroy();
        };
    }, []);

    useEffect(() => {
        liveJudgeRef.current = liveJudge;
    }, [liveJudge]);

    if (loader) return (
        <div className="w-screen h-screen flex justify-center items-center">
            <Spinner />
        </div>
    );

    return (
        <div className="w-screen h-screen flex bg-[#09090b] relative overflow-hidden">

            {isVsStockfish && showWelcome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-zinc-100">Playing with Stockfish</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            You are playing against Stockfish. You can use LLM support to analyse the position you are playing.
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="mt-2 w-full py-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 cursor-pointer text-sm font-medium text-white transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <aside className="relative z-10 flex flex-col w-56 h-full border-r border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm shrink-0">
                <div className="p-4 border-b border-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Opponent</p>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs text-zinc-400">?</div>
                        <div>
                            <p className="text-sm font-medium text-zinc-200 leading-none">Anonymous</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{CHESS_PIECES_COLOR.WHITE}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex items-center gap-1.5 mb-3">
                        <History size={12} className="text-zinc-600" />
                        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Moves</p>
                    </div>
                    {moves && moves.length === 0 ? (
                        <p className="text-xs text-zinc-700 italic">No moves yet</p>
                    ) : (
                        <div className="space-y-0.5 text-xs font-mono">
                            {Array.from({ length: Math.ceil(game.history().length / 2) }, (_, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600 w-5">{i + 1}.</span>
                                    <span className="text-zinc-300">{game.history()[i * 2]}</span>
                                    {game.history()[i * 2 + 1] && <span className="text-zinc-500">{game.history()[i * 2 + 1]}</span>}
                                </div>
                            ))}
                            {moves.map((move, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600 w-5">{i + 1}.</span>
                                    <span className="text-zinc-300">{move?.from}</span>
                                    <span className="text-zinc-500">{move?.to}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t border-zinc-800/40 p-4">
                    {isVsStockfish && (
                        <button
                            onClick={() => {
                                setLiveJudge(true);
                                gameAnalyticsMutation.mutate({
                                    pv: lastEvalRef.current?.pv,
                                    currentPlayer: currentPlayerRef.current,
                                    opponentColor: currentPlayerRef.current === CHESS_PIECES_COLOR.WHITE ? CHESS_PIECES_COLOR.BLACK : CHESS_PIECES_COLOR.WHITE,
                                    currentGame: gameRef.current.fen(),
                                })
                            }}
                            disabled={gameAnalyticsMutation.isPending}
                            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600/30 bg-zinc-700/20 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/40 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Scale size={13} />
                            {liveJudge ? "Disable" : "Enable"} Live Judge
                        </button>
                    )}
                    {gameOver ? (
                        <button
                            onClick={handleReset}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600/30 bg-zinc-700/20 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700/40 hover:text-zinc-100"
                        >
                            Play Again
                        </button>
                    ) : (
                        <button
                            onClick={handleResign}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                            <Flag size={13} />
                            Resign
                        </button>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">You</p>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-medium">
                            {user?._id?.substring(0, 2).toUpperCase() ?? "ME"}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-200 leading-none">You</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{CHESS_PIECES_COLOR.WHITE}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="relative z-10 flex-1 flex items-center justify-center">
                {(!gameId && !isVsStockfish) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[6px] text-white">
                        <div className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10 animate-[spin_10s_linear_infinite] blur-[60px] pointer-events-none" />
                        <div className="flex flex-col items-center gap-6 relative z-10 p-8">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 border-r-2 border-transparent animate-spin h-20 w-20 -left-2 -top-2 opacity-80" />
                                <div className="absolute inset-2 rounded-full border-b-2 border-blue-400 border-l-2 border-transparent animate-[spin_1.5s_linear_infinite_reverse] h-12 w-12 top-0 left-0 opacity-80" />
                                <div className="flex items-center justify-center h-16 w-16 text-zinc-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                        <path d="M12 21v-4" />
                                        <path d="m15 17 3 4" />
                                        <path d="m9 17-3 4" />
                                        <path d="M12 3a2 2 0 0 0-2 2c0 1.11.89 2 2 2s2-.89 2-2a2 2 0 0 0-2-2Z" />
                                        <path d="M15.5 13H8.5c-.83 0-1.5-1.12-1.5-2.5s.67-2.5 1.5-2.5h7c.83 0 1.5 1.12 1.5 2.5s-.67 2.5-1.5 2.5Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-white from-emerald-200 to-blue-200">
                                    Analysis
                                </h2>
                                <p className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Trying to find similar previous games</p>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-gray-400/80 animate-[bounce_1s_infinite_-0.3s]" />
                                <div className="w-1 h-1 rounded-full bg-gray-400/80 animate-[bounce_1s_infinite_-0.15s]" />
                                <div className="w-1 h-1 rounded-full bg-gray-400/80 animate-[bounce_1s_infinite_0s]" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-10" style={{ height: "500px" }}>
                    <div
                        className={`transition-all duration-1000 ease-in-out shadow-2xl rounded-sm overflow-hidden border border-zinc-800/50 ${(!gameId && !isVsStockfish) ? "opacity-20 scale-[0.98] blur-[4px] saturate-50" : "opacity-100 scale-100"}`}
                        style={{ width: "500px", height: "100%", pointerEvents: gameId || isVsStockfish ? "auto" : "none" }}
                    >
                        <ChessBoard options={{ position: game.fen(), onPieceDrop: onDrop }} />
                    </div>

                    <div className="" style={{ width: "500px", height: "100%" }}>
                        <LLM messages={messages} setMessages={setMessages} mutation={chatMutation} messagesEndRef={messagesEndRef} scrollToBottom={scrollToBottom} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Arena;
