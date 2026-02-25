import { BLACK, WHITE } from "chess.js";

export const NODE_ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
}

export const UCI_COMMANDS = {
    NAME: "name",
    VALUE: "value",
    UCINEWGAME: "ucinewgame",
    UCI_OK: "uciok",
    UCI: "uci",
    IS_READY: "isready",
    POSITION: "position",
    GO: "go",
    STOP: "stop",
    QUIT: "quit",
    DEPTH: "depth",
    STARTPOS: "startpos",
    MOVE: "move",
    PGN: "pgn",
    FEN: "fen",
    SETOPTION: "setoption",
    GETOPTION: "getoption",
    PERFT: "perft",
    PONDER: "ponder",
    EVAL: "eval",
    NULLMOVE: "nullmove",
    BESTMOVE: "bestmove"
}

export const MESSAGE_TYPE = {
    USER: "user",
    MODEL: "model",
} as const;

export const CHESS_PIECES_COLOR = {
    WHITE: WHITE,
    BLACK: BLACK,
} as const;   