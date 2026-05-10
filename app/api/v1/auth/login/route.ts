import User from "@/db/mongodb/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { decrypt } from "@/lib/helper";

export async function POST(request: NextRequest) {
    try {

        const reqBody = await request.json();
        const { email, password } = reqBody;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const decryptedPassword = decrypt(password);
        const validPassword = await bcryptjs.compare(decryptedPassword, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        const tokenData = {
            id: user._id,
            userName: user.userName,
            email: user.email
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
            expiresIn: "1d"
        });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            user: { _id: user._id, userName: user.userName, email: user.email }
        });

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/"
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
