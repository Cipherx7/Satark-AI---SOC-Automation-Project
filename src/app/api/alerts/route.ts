import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const alerts = await db
            .collection("alerts")
            .find({})
            .sort({ _id: -1 })
            .toArray();

        // Convert MongoDB _id to string for JSON serialization
        const cleaned = alerts.map((alert) => ({
            ...alert,
            _id: alert._id.toString(),
        }));

        return NextResponse.json(cleaned);
    } catch (error) {
        console.error("❌ MongoDB error:", error);
        return NextResponse.json(
            { error: "Failed to fetch alerts from database" },
            { status: 500 }
        );
    }
}
