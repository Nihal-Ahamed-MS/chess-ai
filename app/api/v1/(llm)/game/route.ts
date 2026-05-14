import { getGameDb } from "@/db/postgres/connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get("gameId");
        const playerId = searchParams.get("playerId");

        const db = getGameDb();

        if (gameId) {
            const { rows } = await db.query(
                "SELECT id, white, black, result, fen, moves FROM games WHERE id = $1",
                [gameId],
            );
            if (!rows[0]) {
                return NextResponse.json({ error: "Game not found" }, { status: 404 });
            }
            return NextResponse.json({ game: rows[0] });
        }

        if (playerId) {
            const { rows } = await db.query(
                "SELECT id, white, black, result, fen, moves FROM games WHERE white = $1 OR black = $1",
                [playerId],
            );
            return NextResponse.json({ games: rows });
        }

        const { rows } = await db.query(
            "SELECT id, white, black, result, fen, moves FROM games",
        );
        return NextResponse.json({ games: rows });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch games";
        console.error("Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
