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

    // Fetch the latest password reset request for this email with deterministic ordering
    const latestReset = await prisma.adminPasswordReset.findFirst({
      where: { email },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    if (!latestReset) {
      return NextResponse.json(
        { error: "No password reset request found for this email. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (latestReset.usedAt !== null) {
      return NextResponse.json(
        { error: "This verification code has already been used. Please request a new verification code." },
        { status: 400 }
      );
    }

    if ((latestReset.attempts ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Check expiration against current time
    const expiryTime = new Date(latestReset.expiresAt).getTime();
    if (Number.isNaN(expiryTime) || Date.now() > expiryTime) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const otpHash = createHash("sha256").update(otp).digest("hex");
    if (latestReset.otpHash !== otpHash) {
      // Atomically increment attempt counter on the latest request
      await prisma.adminPasswordReset.update({
        where: { id: latestReset.id },
        data: { attempts: { increment: 1 } },
      }).catch(() => {});

      return NextResponse.json(
        { error: "Incorrect 6-digit verification code. Please check your newest email and enter the latest code." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atomically claim the OTP (ensuring usedAt was still null) and update the password in a single transaction
    const updateResult = await prisma.$transaction(async (tx) => {
      const claim = await tx.adminPasswordReset.updateMany({
        where: {
          id: latestReset.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        return { success: false, reason: "ALREADY_CLAIMED" };
      }

      await tx.adminUser.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
          email,
          password: hashedPassword,
          name: "MM Laptop Center Admin",
        },
      });

      return { success: true };
    });

    if (!updateResult.success) {
      return NextResponse.json(
        { error: "This verification code has already been used. Please request a new verification code." },
        { status: 400 }
      );
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