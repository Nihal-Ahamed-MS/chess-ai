import { MESSAGE_TYPE } from "@/lib/constants";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = ({ currentPlayer, currentGame }: { currentPlayer: string, currentGame: string }) => `You are a chess coach and MODEL integrated into a Chess AI application. 
You help users improve their chess game by answering questions about chess strategy, openings, endgames, tactics, and general chess knowledge. 
Keep your responses concise and helpful. Use algebraic notation when referring to moves.

Do not use the below details if the user does not ask to analyze current game, otherwise just use the user message content to answer the question.
Player piece color: ${currentPlayer}
Current Game FEN: ${currentGame}
`;

const SYSTEM_INSTRUCTION_FOR_GAME_ANALYTICS = ({ pv, currentPlayer, currentGame }: { pv: string, currentPlayer: string, currentGame: string }) => `
You are a chess coach and MODEL integrated into a Chess AI application.
You help current user improve their chess game by analyzing their games and providing feedback.
Keep your responses concise and helpful. Use algebraic notation when referring to moves. You are provided with the Principle Variable (PV) and FEN of the current move.

Here are the game details:
PV: ${pv}
Player piece color: ${currentPlayer}
Current Game FEN: ${currentGame}`;

const SYSTEM_INSTRUCTION_FOR_SIMILAR_LOSSES = ({ playerColor, games, outcome }: { playerColor: string, games: string, outcome: string }) => `
You are a chess coach. The player was playing as ${playerColor} and ${outcome === 'win' ? 'won' : 'lost'} these games, which are positionally similar to their most recent game.
${outcome === 'win'
    ? 'Identify the key moves, tactical patterns, and strategic decisions that led to these wins. What should the player keep doing?'
    : 'Identify the recurring mistakes, tactical patterns, or strategic errors that caused these losses. What should the player fix?'}
Be specific about move sequences. Keep your response concise and actionable.

Games (moves in UCI notation):
${games}`;

export const ANALYZE_GAME_WITH_LLM = async ({ pv, currentPlayer, currentGame }: { pv: string, currentPlayer: string, currentGame: string }) => {
    const response = await GEMINI_API.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [
            { role: MESSAGE_TYPE.USER, parts: [{ text: "Analyze this game" }] },
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_FOR_GAME_ANALYTICS({ pv, currentPlayer, currentGame }),
        },
    });

    return response;
}

export const ANALYZE_SIMILAR_LOSSES = async ({ playerColor, games, outcome }: { playerColor: string, games: string, outcome: string }) => {
    const userPrompt = outcome === 'win'
        ? 'What patterns helped me win these similar games?'
        : 'What mistakes am I repeatedly making in these similar lost games?';

    const response = await GEMINI_API.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [
            { role: MESSAGE_TYPE.USER, parts: [{ text: userPrompt }] },
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_FOR_SIMILAR_LOSSES({ playerColor, games, outcome }),
        },
    });

    return response;
}

export const CHAT_WITH_LLM = async ({ messages, currentPlayer, currentGame }: { messages: any[], currentPlayer: string, currentGame: string }) => {
    const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const response = await GEMINI_API.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [
            ...history,
            { role: MESSAGE_TYPE.USER, parts: [{ text: lastMessage }] },
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION({ currentPlayer, currentGame }),
        },
    });

    return response;
}