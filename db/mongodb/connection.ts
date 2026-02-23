import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { NODE_ENV } from "@/lib/constants";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

const options = {
    maxPoolSize: 20,
};

let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoConnection(): Promise<MongoClient> {
    try {
        const client = new MongoClient(uri, options);

        if (mongoose.connection.readyState === 0) {
            mongoose.connect(uri)
                .then(() => console.log("Successfully connected to Mongoose Schemas."))
                .catch(err => console.error("Mongoose connection failed", err));
        }

        return client.connect()
            .then((connectedClient) => {
                console.log("Successfully connected to MongoDB.");
                return connectedClient;
            })
            .catch((error) => {
                console.error("Error connecting to MongoDB:", error);
                throw error;
            });
    } catch (error) {
        console.error("Failed to initialize MongoDB client (Please check your MONGODB_URI):", error);
        return Promise.reject(error);
    }
}

if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = createMongoConnection();
    }
    clientPromise = global._mongoClientPromise;
} else {
    clientPromise = createMongoConnection();
}

export default clientPromise;