import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const billing = await db.getBillingAccount();
    const transactions = await db.getCreditTransactions();
    return NextResponse.json({
      success: true,
      billing,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch billing info" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "purchase_credits", amount = 100, reason = "Top-up Credits" } = body;

    if (action === "purchase_credits") {
      const updated = await db.addCredits(Number(amount), reason);
      const transactions = await db.getCreditTransactions();
      return NextResponse.json({
        success: true,
        billing: updated,
        transactions,
        message: `Successfully added ${amount} credits to your account.`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid billing action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process billing request" },
      { status: 500 }
    );
  }
}
