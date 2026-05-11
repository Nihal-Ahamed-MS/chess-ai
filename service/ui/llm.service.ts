import { MESSAGE_TYPE } from "@/lib/constants";
import axios from "axios";

export interface ChatMessage {
    role: typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];
    content: string;
}

export const sendChatMessage = async ({ messages, currentPlayer, currentGame }: { messages: ChatMessage[], currentPlayer: String, currentGame: String }): Promise<string> => {
    const { data } = await axios.post("/api/v1/chat", { messages, currentPlayer, currentGame });
    return data.message;
};

export const sendGameAnalytics = async ({ messages, pv, currentPlayer, currentGame }: { messages: ChatMessage[], currentPlayer: String, currentGame: String, pv: String }): Promise<string> => {
    const { data } = await axios.post("/api/v1/game-analytics", { messages, pv, currentPlayer, currentGame });
    return data.message;
};

export interface GameAnalyticsResult {
    success: boolean;
    wins: number;
    losses: number;
    draws: number;
    total: number;
}

export const submitGameEmbedding = async (payload: {
    gameId: string | null;
    moves: string[];
    winner: string;
    playerColor: string;
    finalFen: string;
    playerId: string | null;
}): Promise<GameAnalyticsResult> => {
    const { data } = await axios.put<GameAnalyticsResult>("/api/v1/game-analytics", payload);
    return data;
};
