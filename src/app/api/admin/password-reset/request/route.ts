import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminPasswordResetEmail } from "@/lib/order-email";

const genericResponse = { message: "If that email belongs to an admin, a reset code has been sent." };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) return NextResponse.json(genericResponse);
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) return NextResponse.json(genericResponse);

    const otp = randomInt(100000, 1000000).toString();
    await prisma.adminPasswordReset.deleteMany({ where: { email } });
    await prisma.adminPasswordReset.create({ data: { email, otpHash: createHash("sha256").update(otp).digest("hex"), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
    await sendAdminPasswordResetEmail(email, otp);
    return NextResponse.json(genericResponse);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}