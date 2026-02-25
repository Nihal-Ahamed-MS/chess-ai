
"use client";

import { Chess } from "chess.js";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import stockfishService, { EvalInfo } from "@/service/ui/stockfish.service";
import ChessBoard from "@/components/chessboard";
import { Spinner } from "@/components/ui/spinner";
import { CHESS_PIECES_COLOR, MESSAGE_TYPE, UCI_COMMANDS } from "@/lib/constants";
import LLM from "@/components/LLM";
import { ChatMessage, sendChatMessage, sendGameAnalytics } from "@/service/ui/llm.service";
import { useMutation } from "@tanstack/react-query";

const Arena = () => {
    const [loader, setLoader] = useState(true);

    const currentPlayerRef = useRef(CHESS_PIECES_COLOR.WHITE);
    const [game, setGame] = useState(new Chess());
    const gameRef = useRef(game);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }

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

                gameAnalyticsMutation.mutate({
                    pv: message.pv,
                    currentPlayer: currentPlayerRef.current,
                    opponentColor: currentPlayerRef.current === CHESS_PIECES_COLOR.WHITE ? CHESS_PIECES_COLOR.BLACK : CHESS_PIECES_COLOR.WHITE,
                    currentGame: gameRef.current.fen(),
                });
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

    return (
        <div className="w-screen h-screen flex justify-center items-center">

            <div className="w-md h-500px">
                <LLM messages={messages} setMessages={setMessages} mutation={chatMutation} messagesEndRef={messagesEndRef} scrollToBottom={scrollToBottom} />
            </div>
            <div style={{ width: "500px", height: "500px" }}>
                <ChessBoard options={{ position: game.fen(), onPieceDrop: onDrop }} />
            </div>
        </div>
    );
};

export default Arena;