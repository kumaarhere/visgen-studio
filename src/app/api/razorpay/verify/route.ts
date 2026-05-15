import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      plan 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await connectDB();
      
      // Credits based on plan: pro=100, premium=250
      const PLAN_CREDITS: Record<string, number> = { pro: 100, premium: 250 };
      const credits = PLAN_CREDITS[plan] ?? 0;

      await User.findByIdAndUpdate(userId, {
        plan: plan,
        $set: { credits: credits },
      });

      console.log(`Payment verified for user ${userId}. Plan: ${plan}`);
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.error("Signature verification failed");
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[Razorpay Verify Error]", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
