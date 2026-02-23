
"use client";

import { Chess } from "chess.js";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";

const Arena = () => {
    const params = useParams();
    const engineRef = useRef<any>(null);

    // Configured options based on the requested ChessboardOptions type
    const chessboardOptions = {
        id: "arena-board",
        boardOrientation: "white" as const,
        chessboardRows: 8,
        chessboardColumns: 8,
        boardStyle: {},
        squareStyle: {},
        squareStyles: {},
        darkSquareStyle: { backgroundColor: "#B58863" },
        lightSquareStyle: { backgroundColor: "#F0D9B5" },
        dropSquareStyle: { boxShadow: "inset 0 0 1px 4px rgba(255, 255, 0, 0.5)" },
        draggingPieceStyle: {},
        draggingPieceGhostStyle: { opacity: 0.5 },
        darkSquareNotationStyle: { color: "#F0D9B5" },
        lightSquareNotationStyle: { color: "#B58863" },
        alphaNotationStyle: {},
        numericNotationStyle: {},
        showNotation: true,
        animationDurationInMs: 300,
        showAnimations: true,
        allowDragging: true,
        allowDragOffBoard: false,
        allowAutoScroll: true,
        dragActivationDistance: 0,
        allowDrawingArrows: true,
        arrows: [],
        clearArrowsOnClick: true,
        clearArrowsOnPositionChange: false,

        // Handlers
        canDragPiece: ({ isSparePiece, piece, square }: any) => true,
        onArrowsChange: ({ arrows }: any) => { },
        onMouseOutSquare: ({ piece, square }: any) => { },
        onMouseOverSquare: ({ piece, square }: any) => { },
        onPieceClick: ({ isSparePiece, piece, square }: any) => { },
        onPieceDrag: ({ isSparePiece, piece, square }: any) => { },
        onSquareClick: ({ piece, square }: any) => { },
        onSquareMouseDown: ({ piece, square }: any, e: any) => { },
        onSquareMouseUp: ({ piece, square }: any, e: any) => { },
        onSquareRightClick: ({ piece, square }: any) => { },
    };

    const [game, setGame] = useState(new Chess());

    function onDrop({ piece, sourceSquare, targetSquare }: any) {
        console.log(sourceSquare, targetSquare);
        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) return false;

        setGame(new Chess(game.fen()));
        return true;
    }

    useEffect(() => {
        const stockfish = require("stockfish");
        const engine = stockfish();

        engineRef.current = engine;

        engine.postMessage("uci");
        engine.postMessage("isready");

        engine.onmessage = (event: any) => {
            console.log("Engine:", event);
        };

        engine.postMessage("position startpos");
        engine.postMessage("go depth 15");

        return () => engine.terminate();
    }, []);

    return (
        <div>
            <h1>Arena {params.slug}</h1>

            <div style={{ width: "500px", height: "500px" }}>
                <Chessboard
                    options={{ ...chessboardOptions, position: game.fen(), onPieceDrop: onDrop, arrows: [] }}
                />
            </div>
        </div>
    );
};

export default Arena;