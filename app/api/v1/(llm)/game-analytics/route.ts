import { ANALYZE_GAME_WITH_LLM } from "@/service/backend/llm.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { pv, currentPlayer, currentGame } = await req.json();

        const response = await ANALYZE_GAME_WITH_LLM({ pv, currentPlayer, currentGame });
        const text = response.text ?? "";
        return NextResponse.json({ message: text });
    } catch (error: any) {
        console.error("[Chat API] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate response" },
            { status: 500 }
        );
    }
}