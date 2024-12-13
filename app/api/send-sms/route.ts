import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const serviceSid = process.env.TWILIO_SERVICE_SID!;
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse incoming request body
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // Use Twilio Verify API to send SMS
    const verification = await client.verify.v2.services(serviceSid).verifications.create({
      to: phoneNumber,
      channel: 'sms',
    });

    return NextResponse.json({ success: true, sid: verification.sid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
