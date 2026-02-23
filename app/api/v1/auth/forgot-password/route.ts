import User from "@/db/mongodb/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const hashedToken = await bcryptjs.hash(user._id.toString(), 10);
        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = new Date(Date.now() + 3600000);
        await user.save();

        return NextResponse.json({
            message: "Forgot password token generated successfully",
            success: true,
            resetToken: hashedToken
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
