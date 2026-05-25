import { ANALYZE_GAME_WITH_LLM, ANALYZE_SIMILAR_LOSSES } from "@/service/backend/llm.service";
import { getGameDb } from "@/db/postgres/connection";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');
        const playerId = searchParams.get('playerId');

        if (!gameId || !playerId) {
            return NextResponse.json({ error: 'gameId and playerId are required' }, { status: 400 });
        }

        const db = getGameDb();

        const { rows: gameRows } = await db.query<{ white: string; black: string; result: string }>(
            'SELECT white, black, result, fen, moves FROM games WHERE id = $1',
            [gameId],
        );

        const currentGame = gameRows[0];
        if (!currentGame) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const playerColor = currentGame.white === playerId ? 'white' : 'black';
        const playerWon = currentGame.result === playerId
        const outcome = playerWon ? 'win' : 'loss';

        const winFilter = `g.result = $2`;
        const lossFilter = `(g.white = $2 OR g.black = $2) AND g.result != $2 AND g.result != 'draw'`;
        const outcomeFilter = playerWon ? winFilter : lossFilter;

        const { rows } = await db.query<{ moves: { from: string; to: string }[] | null }>(
            `WITH target AS (
                SELECT embedding FROM games WHERE id = $1 AND embedding IS NOT NULL
            ),
            nearby AS (
                SELECT g.moves
                FROM games g, target t
                WHERE g.id != $1
                  AND g.embedding IS NOT NULL
                  AND (${outcomeFilter})
                ORDER BY g.embedding <=> t.embedding
                LIMIT 5
            )
            SELECT moves FROM nearby`,
            [gameId, playerId],
        );

        if (rows.length === 0) {
            return NextResponse.json({
                analysis: null,
                outcome,
                gameData: currentGame,
                message: `No similar ${outcome === 'win' ? 'won' : 'lost'} games found yet.`,
            });
        }

        const gamesText = rows
            .map((r, i) => {
                const moveList = (r.moves ?? []).map((m) => `${m.from}${m.to}`).join(' ');
                return `Game ${i + 1}: ${moveList || '(no moves recorded)'}`;
            })
            .join('\n');

        const response = await ANALYZE_SIMILAR_LOSSES({ playerColor, games: gamesText, outcome });
        return NextResponse.json({ analysis: response.text ?? '', outcome, gameData: currentGame });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { gameId, moves, winner, playerColor, finalFen, playerId } = await req.json();

        const db = getGameDb();

        const { rows: existing } = await db.query<{ has_embedding: boolean }>(
            'SELECT embedding IS NOT NULL AS has_embedding FROM games WHERE id = $1',
            [gameId],
        );

        if (!existing[0]?.has_embedding) {
            const moveText = `Chess gameData moves: ${(moves as string[]).join(' ')} Final position: ${finalFen} Winner: ${winner} Player color: ${playerColor}`;

            const embedResult = await genAI.models.embedContent({
                model: 'gemini-embedding-2',
                contents: [{ text: moveText }],
                config: { outputDimensionality: 768 },
            });

            const embedding: number[] = embedResult.embeddings?.[0]?.values ?? [];
            if (embedding.length === 0) {
                return NextResponse.json({ error: 'Embedding generation failed' }, { status: 500 });
            }

            await db.query(
                'UPDATE games SET embedding = $1::vector WHERE id = $2',
                [`[${embedding.join(',')}]`, gameId],
            );
        }

        if (!playerId) {
            return NextResponse.json({ success: true });
        }

        const { rows } = await db.query<{ wins: string; losses: string; draws: string; total: string }>(
            `WITH target AS (
                SELECT embedding FROM games WHERE id = $1 AND embedding IS NOT NULL
            ),
            nearby AS (
                SELECT g.white, g.black, g.result
                FROM games g, target t
                WHERE g.id != $1
                  AND g.embedding IS NOT NULL
                  AND (g.white = $2 OR g.black = $2)
                ORDER BY g.embedding <=> t.embedding
                LIMIT 20
            )
            SELECT
                COUNT(*) FILTER (
                    WHERE (white = $2 AND result = 'white') OR (black = $2 AND result = 'black')
                ) AS wins,
                COUNT(*) FILTER (
                    WHERE (white = $2 AND result = 'black') OR (black = $2 AND result = 'white')
                ) AS losses,
                COUNT(*) FILTER (WHERE result = 'draw') AS draws,
                COUNT(*) AS total
            FROM nearby`,
            [gameId, playerId],
        );

        const row = rows[0] ?? { wins: '0', losses: '0', draws: '0', total: '0' };
        return NextResponse.json({
            success: true,
            wins: Number(row.wins),
            losses: Number(row.losses),
            draws: Number(row.draws),
            total: Number(row.total),
        });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate embedding' },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { pv, currentPlayer, currentGame } = await req.json();

        const response = await ANALYZE_GAME_WITH_LLM({ pv, currentPlayer, currentGame });
        const text = response.text ?? "";
        return NextResponse.json({ message: text });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate response" },
            { status: 500 }
        );
    }
}