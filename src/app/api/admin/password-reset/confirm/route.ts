import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
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

    const reset = await prisma.adminPasswordReset.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!reset || reset.expiresAt <= new Date() || (reset.attempts ?? 0) >= 5) {
      return NextResponse.json(
        { error: "This verification code is invalid or has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const otpHash = createHash("sha256").update(otp).digest("hex");
    if (otpHash !== reset.otpHash) {
      await prisma.adminPasswordReset.update({
        where: { id: reset.id },
        data: { attempts: (reset.attempts || 0) + 1 },
      });
      return NextResponse.json(
        { error: "Incorrect verification code. Please check your email and try again." },
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

    await prisma.adminPasswordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

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