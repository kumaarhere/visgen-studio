import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const PLAN_CREDITS: Record<string, number> = {
  pro: 100,
  premium: 250,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature — mandatory
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    if (!signature) {
      console.error("[Razorpay Webhook] Missing x-razorpay-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[Razorpay Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("[Razorpay Webhook] Event received:", event.event);

    // Handle payment_link.paid event
    if (event.event === "payment_link.paid") {
      const paymentLinkEntity = event?.payload?.payment_link?.entity;
      const paymentEntity = event?.payload?.payment?.entity;

      const notes = paymentLinkEntity?.notes || {};
      const userId: string | undefined = notes?.userId;
      const plan: string | undefined = notes?.plan;
      const customerEmail: string | undefined =
        paymentEntity?.email || paymentLinkEntity?.customer_details?.email;

      const credits = PLAN_CREDITS[plan || ""] ?? 0;

      if (credits === 0) {
        console.error("[Razorpay Webhook] Unknown plan:", plan);
        return NextResponse.json({ received: true, warning: "Unknown plan" });
      }

      await connectDB();

      let updated = false;

      // Primary: lookup by userId passed in notes
      if (userId) {
        const result = await User.findByIdAndUpdate(userId, {
          plan: plan,
          $set: { credits },
        });
        if (result) {
          updated = true;
          console.log(`[Razorpay Webhook] Credits allocated. userId=${userId} plan=${plan} credits=${credits}`);
        }
      }

      // Fallback: lookup by email if userId lookup failed
      if (!updated && customerEmail) {
        const result = await User.findOneAndUpdate(
          { email: customerEmail },
          { plan: plan, $set: { credits } }
        );
        if (result) {
          updated = true;
          console.log(`[Razorpay Webhook] Credits allocated via email fallback. email=${customerEmail} plan=${plan} credits=${credits}`);
        }
      }

      if (!updated) {
        console.error("[Razorpay Webhook] Could not find user to update. notes:", notes);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Razorpay Webhook Error]", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}
