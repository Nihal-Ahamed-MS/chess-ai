import initializeDBConnection from "@/db/mongodb/connection";
import "@/db/mongodb/models/user";

export async function register() {
    console.log("App starting… connecting MongoDB");

    try {
        await initializeDBConnection;
        console.log("MongoDB connected at startup");
    } catch (err) {
        console.error("Mongo connection failed", err);
    }
}