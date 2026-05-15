import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const FREE_CREDITS = 15;
const RESET_INTERVAL_DAYS = 30;

export async function GET(req: NextRequest) {
  // Protect the endpoint with a shared secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RESET_INTERVAL_DAYS);

    // Find free-plan users whose credits were last reset more than 30 days ago
    const result = await User.updateMany(
      {
        plan: "free",
        $or: [
          { creditsResetAt: { $lte: cutoff } },
          { creditsResetAt: { $exists: false } },
        ],
      },
      {
        $set: {
          credits: FREE_CREDITS,
          creditsResetAt: new Date(),
        },
      }
    );

    console.log(`[Cron] Reset credits for ${result.modifiedCount} free users.`);

    return NextResponse.json({
      success: true,
      usersReset: result.modifiedCount,
      resetTo: FREE_CREDITS,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Cron Reset Error]", err);
    return NextResponse.json({ error: err.message || "Reset failed" }, { status: 500 });
  }
}
