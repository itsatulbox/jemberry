import { NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 },
    );
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 400 },
    );
  }
}
