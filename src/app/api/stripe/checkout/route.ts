import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Price IDs from your Stripe dashboard — set these in .env.local
const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || "",
  premium: process.env.STRIPE_PRICE_PREMIUM || "",
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any, // fallback or generic version
    });

    const body = await req.json();
    const { plan, userEmail, userId } = body as { plan: string; userEmail?: string; userId?: string };

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:8080";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${origin}/studio?upgrade=success`,
      cancel_url: `${origin}/?upgrade=cancelled`,
      metadata: { plan, userEmail: userEmail ?? "", userId: userId ?? "" },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe Checkout]", err);
    return NextResponse.json(
      { error: err.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
