import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Amount in Paise (₹149 = 14900, ₹299 = 29900)
const PLAN_PRICES: Record<string, number> = {
  pro: 14900,
  premium: 29900,
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();
    
    if (!PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = PLAN_PRICES[plan];

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId?.slice(-5)}`,
      notes: { 
        userId: userId || "", 
        plan: plan 
      },
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("[Razorpay Order Error]", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
