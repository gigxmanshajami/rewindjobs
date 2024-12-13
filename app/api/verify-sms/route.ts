import { NextResponse } from "next/server";
import twilio from "twilio";

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const serviceSid = process.env.TWILIO_SERVICE_SID!;
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse the incoming request body
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required." },
        { status: 400 }
      );
    }

    // Verify the code with Twilio
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    // Respond with the verification status
    return NextResponse.json(
      { success: true, status: verificationCheck.status },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
