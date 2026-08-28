import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawOtp = typeof body.otp === "string" ? body.otp.trim() : (body.otp !== undefined ? String(body.otp).trim() : "");
    const otp = rawOtp.replace(/\D/g, "");
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Please enter the 6-digit verification code sent to your email." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Fetch recent reset requests for this email
    const resets = await prisma.adminPasswordReset.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (!resets || resets.length === 0) {
      return NextResponse.json(
        { error: "No password reset request found for this email. Please request a new verification code." },
        { status: 400 }
      );
    }

    const otpHash = createHash("sha256").update(otp).digest("hex");
    const matchingReset = resets.find((r) => r.otpHash === otpHash);

    if (!matchingReset) {
      // Increment attempt counter on the latest request
      if (resets[0]) {
        await prisma.adminPasswordReset.update({
          where: { id: resets[0].id },
          data: { attempts: (resets[0].attempts || 0) + 1 },
        }).catch(() => {});
      }
      return NextResponse.json(
        { error: "Incorrect 6-digit verification code. Please check your latest email and try again." },
        { status: 400 }
      );
    }

    if (matchingReset.usedAt !== null) {
      return NextResponse.json(
        { error: "This verification code has already been used. Please request a new code." },
        { status: 400 }
      );
    }

    if ((matchingReset.attempts ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Check expiration safely (handling potential server/DB timezone skews)
    const now = Date.now();
    const createdTime = matchingReset.createdAt ? new Date(matchingReset.createdAt).getTime() : 0;
    const expiryTime = matchingReset.expiresAt ? new Date(matchingReset.expiresAt).getTime() : 0;
    const MAX_LIFETIME_MS = 2 * 60 * 60 * 1000; // 2 hours

    if (createdTime > 0 && (now - createdTime > MAX_LIFETIME_MS) && (expiryTime > 0 && expiryTime < now)) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await prisma.adminUser.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
          email,
          password: hashedPassword,
          name: "MM Laptop Center Admin",
        },
      });
    } catch (dbErr) {
      console.error("[Admin Password Reset DB Error]:", dbErr);
      const existingAdmin = await prisma.adminUser.findFirst({ where: { email } });
      if (existingAdmin) {
        await prisma.adminUser.update({
          where: { id: existingAdmin.id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.adminUser.create({
          data: {
            email,
            password: hashedPassword,
            name: "MM Laptop Center Admin",
          },
        });
      }
    }

    // Mark active reset requests for this email as used
    try {
      await prisma.adminPasswordReset.updateMany({
        where: { email, usedAt: null },
        data: { usedAt: new Date() },
      });
    } catch (updateErr) {
      console.warn("[Admin Password Reset mark used warning]:", updateErr);
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (error: unknown) {
    console.error("[Admin Password Reset Confirm Error]:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}