export interface GameAnalyticsResult {
    success: boolean;
    wins: number;
    losses: number;
    draws: number;
    total: number;
}

export interface GameAnalyticsResponse {
    gameData?: {
        fen: string;
        moves: []
    };
    analysis?: string;
    message?: string;
}