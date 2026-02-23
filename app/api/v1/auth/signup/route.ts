import User from "@/db/mongodb/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { decrypt } from "@/lib/helper";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { userName, email, password } = reqBody;

        const user = await User.findOne({ email });
        const usernameCheck = await User.findOne({ userName });

        if (user || usernameCheck) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const decryptedPassword = decrypt(password);
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(decryptedPassword, salt);

        const newUser = new User({
            userName,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        const hashedToken = await bcryptjs.hash(savedUser._id.toString(), 10);
        savedUser.verifyToken = hashedToken;
        savedUser.verifyTokenExpiry = new Date(Date.now() + 3600000);
        await savedUser.save();

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            user: { _id: savedUser._id, userName: savedUser.userName, email: savedUser.email },
            verifyToken: hashedToken
        });

    } catch (error: any) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
