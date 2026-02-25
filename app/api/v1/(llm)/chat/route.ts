import { CHAT_WITH_LLM } from "@/service/backend/llm.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages, currentPlayer, currentGame } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages are required" },
                { status: 400 }
            );
        }

        const response = await CHAT_WITH_LLM({ messages, currentPlayer, currentGame });
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
