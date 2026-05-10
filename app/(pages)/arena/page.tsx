
"use client";

import { Chess } from "chess.js";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import stockfishService, { EvalInfo } from "@/service/ui/stockfish.service";
import ChessBoard from "@/components/chessboard";
import { Spinner } from "@/components/ui/spinner";
import { CHESS_PIECES_COLOR, COMMUNICATION_MSG, MESSAGE_TYPE, UCI_COMMANDS } from "@/lib/constants";
import LLM from "@/components/LLM";
import { ChatMessage, sendChatMessage, sendGameAnalytics } from "@/service/ui/llm.service";
import { useMutation } from "@tanstack/react-query";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAuth } from "@/store/context/AuthContenxt";

const Arena = () => {
    const [loader, setLoader] = useState(true);
    const { user } = useAuth();

    const currentPlayerRef = useRef(CHESS_PIECES_COLOR.WHITE);
    const [game, setGame] = useState(new Chess());
    const gameRef = useRef(game);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [gameId, setGameId] = useState<string | null>(null);
    const [inQueue, setInQueue] = useState(false);

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        "ws://localhost:8080/game-ws",
        {
            shouldReconnect: () => true,
            onOpen: () => console.log("OPEN"),
            onClose: (e) => console.log("CLOSE", e),
            onError: (e) => console.log("ERROR", e),
            reconnectAttempts: 10,
            reconnectInterval: 3000,
        }
    );

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    const chatMutation = useMutation({
        mutationFn: (payload: any) => sendChatMessage({ messages: payload, currentPlayer: currentPlayerRef.current, currentGame: gameRef.current.fen() }),
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

    const onDrop = useCallback(({ piece, sourceSquare, targetSquare }: any) => {
        const currentGame = gameRef.current;

        const move = currentGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) return false;

        const updatedGame = new Chess(currentGame.fen());
        setGame(updatedGame);

        console.log("Updatedgame:", updatedGame.fen());
        stockfishService.evaluatePosition(updatedGame.fen(), 15);

        // 3. Once game started whenever user plays send moves
        if (gameId && user?._id) {
            sendJsonMessage({
                Move: {
                    game_id: gameId,
                    player_id: user._id,
                    from: sourceSquare,
                    to: targetSquare
                }
            });
        }

        return true;
    }, [gameId, user, sendJsonMessage]);

    const initializeStockfish = () => {
        stockfishService.init().then(() => {
            setLoader(false);
            stockfishService.newGame();
        }).catch((err) => {
            console.error(err);
            setLoader(false);
        });
    }

    useEffect(() => {
        if (readyState === ReadyState.OPEN && user?._id) {
            console.log("WebSocket connected. Sending Init and joining queue...");
            setInQueue(true);

            // Fallback for internally tagged serde just in case
            sendJsonMessage({ type: COMMUNICATION_MSG.Init, player_id: user._id });
        }
    }, [readyState, user]);

    useEffect(() => {
        // Listen for standard events from backend to capture Game ID
        if (lastJsonMessage) {
            const msg: any = lastJsonMessage;
            if (msg.type === "matched") {
                setGameId(msg);
                setInQueue(false);
            } else if (msg.type === "Waiting" || msg.Waiting) {
                setInQueue(true);
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        initializeStockfish();

        const unsubscritEval = stockfishService.onEvaluation((message: EvalInfo) => {
            console.log(message, "test")

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

                console.log("Stockfish played:", bestMove);
                setGame(new Chess(currentGame.fen()));

                // gameAnalyticsMutation.mutate({
                //     pv: message.pv,
                //     currentPlayer: currentPlayerRef.current,
                //     opponentColor: currentPlayerRef.current === CHESS_PIECES_COLOR.WHITE ? CHESS_PIECES_COLOR.BLACK : CHESS_PIECES_COLOR.WHITE,
                //     currentGame: gameRef.current.fen(),
                // });
            }
        });

        const unsubscribeGeneral = stockfishService.onMessage((message: string) => {
            // console.info("Stockfish:", message);
        });

        return () => {
            unsubscritEval();
            unsubscribeGeneral();
            stockfishService.destroy();
        };
    }, []);

    if (loader) return (
        <div className="w-screen h-screen flex justify-center items-center">
            <Spinner />
        </div>
    );


    if (!gameId || inQueue) {
        return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[8px] rounded-sm text-white overflow-hidden border border-white/5">
                {/* Dynamic glow effect */}
                <div className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10 animate-[spin_10s_linear_infinite] blur-[60px] pointer-events-none" />

                <div className="flex flex-col items-center gap-6 relative z-10 p-8 transform transition-all duration-500 scale-100">
                    <div className="relative">
                        {/* Beautiful modern dual spinner */}
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

                    <div className="text-center space-y-3 mt-2">
                        <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-blue-200">
                            Finding Opponent
                        </h2>
                        <p className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">
                            Matchmaking in progress
                        </p>
                    </div>

                    {/* Decorative animated dots */}
                    <div className="flex gap-1.5 mt-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-[bounce_1s_infinite_-0.3s]"></div>
                        <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-[bounce_1s_infinite_-0.15s]"></div>
                        <div className="w-1 h-1 rounded-full bg-blue-400/80 animate-[bounce_1s_infinite_0s]"></div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="w-screen h-screen flex justify-center items-center bg-[#09090b] relative overflow-hidden">
            {/* Background elegant gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#09090b] to-[#09090b] z-0"></div>

            <div className="w-md h-500px z-10 relative">
                {/* <LLM messages={messages} setMessages={setMessages} mutation={chatMutation} messagesEndRef={messagesEndRef} scrollToBottom={scrollToBottom} /> */}
            </div>

            <div className="relative z-10 flex flex-col items-center" style={{ width: "500px" }}>

                <div
                    className={`transition-all duration-1000 ease-in-out shadow-2xl rounded-sm overflow-hidden border border-zinc-800/50 ${(!gameId || inQueue) ? "opacity-30 scale-[0.98] blur-[4px] saturate-50" : "opacity-100 scale-100"}`}
                    style={{ width: "500px", height: "500px", pointerEvents: gameId ? "auto" : "none" }}
                >
                    <ChessBoard options={{ position: game.fen(), onPieceDrop: onDrop }} />
                </div>
            </div>
        </div>
    );
};

export default Arena;