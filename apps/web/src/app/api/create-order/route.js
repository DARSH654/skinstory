import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured on server" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawAmount = body.amount !== undefined ? Number(body.amount) : 499; // default 499 (e.g. 4.99 USD or 499 INR in paise/cents)
    const currency = (body.currency || "INR").toUpperCase();
    const receipt = body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const notes = body.notes || {};

    // Validate minimum amount >= 100 (100 paise / 1 INR)
    if (!rawAmount || isNaN(rawAmount) || rawAmount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (1 INR)." },
        { status: 400 }
      );
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(rawAmount),
      currency,
      receipt,
      notes,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        error: error?.error?.description || error?.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
