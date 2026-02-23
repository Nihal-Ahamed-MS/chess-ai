import { Chessboard } from "react-chessboard";

const ChessBoard = ({ options }: any) => {

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

    return <Chessboard options={{ ...chessboardOptions, ...options }} />
}

export default ChessBoard;