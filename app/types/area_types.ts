export type GameResult = { winner: 'white' | 'black' | 'draw'; reason: string };

export type ServerMessage =
    | { type: 'Connected' }
    | { type: 'Waiting' }
    | { type: 'Matched'; game_id: string }
    | { type: 'Move'; from: string; to: string; fen: string }
    | { type: 'Ended' }
    | { game_status: 'OnGoing'; id: string; fen: string; white: string; black: string };