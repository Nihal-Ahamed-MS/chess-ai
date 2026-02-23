
"use client";

import { Chess } from "chess.js";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import stockfishService from "@/service/stockfish.service";
import ChessBoard from "@/components/chessboard";
import { Spinner } from "@/components/ui/spinner";
import { UCI_COMMANDS } from "@/lib/constants";

const Arena = () => {
    const params = useParams();
    const [loader, setLoader] = useState(true);
    const [game, setGame] = useState(new Chess());
    const gameRef = useRef(game);

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

        const unsubscribe = stockfishService.onMessage((message: string) => {
            console.info("Stockfish:", message);

            if (message.startsWith(UCI_COMMANDS.BESTMOVE)) {
                const bestMove = message.split(" ")[1];
                if (!bestMove || bestMove === "(none)") return;

                const currentGame = gameRef.current;

                const move = currentGame.move({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: bestMove.length > 4 ? bestMove.substring(4) : undefined,
                });

                if (move === null) return;

                console.log("Stockfish played:", bestMove);
                setGame(new Chess(currentGame.fen()));
            }
        });

        return () => {
            unsubscribe();
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
            <div style={{ width: "500px", height: "500px" }}>
                <ChessBoard options={{ position: game.fen(), onPieceDrop: onDrop }} />
            </div>
        </div>
    );
};

export default Arena;