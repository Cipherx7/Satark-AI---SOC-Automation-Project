import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "soc_dashboard";

if (!MONGODB_URI) {
    console.warn(
        "⚠️  MONGODB_URI is not set in .env — falling back to sample data."
    );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Returns a cached MongoDB connection.
 * Uses connection pooling so we don't create a new connection on every request.
 */
export async function connectToDatabase(): Promise<{
    client: MongoClient;
    db: Db;
}> {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured");
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}
