import mongoose, { Schema, Model } from "mongoose";

const UserSchema = new Schema(
    {
        userName: {
            type: String,
            required: [true, "Please provide a username"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, /* By default, avoid returning password fields in queries */
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        forgotPasswordToken: String,
        forgotPasswordTokenExpiry: Date,
        verifyToken: String,
        verifyTokenExpiry: Date,
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
