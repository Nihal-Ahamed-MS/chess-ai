import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("session")?.value || "";

        if (!token) {
            return NextResponse.json({ error: "No token provided" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET || "default_secret");

        return NextResponse.json({
            message: "Session is valid",
            user: {
                _id: decoded.id,
                userName: decoded.userName,
                email: decoded.email
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
