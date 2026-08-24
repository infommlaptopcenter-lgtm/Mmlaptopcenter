import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!email || !/^\d{6}$/.test(otp) || newPassword.length < 6) return NextResponse.json({ error: "Enter a valid code and a password of at least 6 characters." }, { status: 400 });

    const reset = await prisma.adminPasswordReset.findFirst({ where: { email, usedAt: null }, orderBy: { createdAt: "desc" } });
    if (!reset || reset.expiresAt <= new Date() || reset.attempts >= 5) return NextResponse.json({ error: "This reset code is invalid or expired." }, { status: 400 });
    const otpHash = createHash("sha256").update(otp).digest("hex");
    if (otpHash !== reset.otpHash) {
      await prisma.adminPasswordReset.update({ where: { id: reset.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "This reset code is invalid or expired." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.adminUser.update({ where: { email }, data: { password: await bcrypt.hash(newPassword, 10) } }),
      prisma.adminPasswordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}