import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminPasswordResetEmail } from "@/lib/order-email";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid admin email address." },
        { status: 400 }
      );
    }

    const configuredAdminUser = (process.env.ADMIN_USER || process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    let admin = await prisma.adminUser.findFirst({ where: { email } });

    // If admin is configured in env but not in DB yet, create it
    if (!admin && configuredAdminUser && email === configuredAdminUser) {
      const defaultPass = process.env.ADMIN_PASS || "admin123";
      const hashedPassword = await bcrypt.hash(defaultPass, 10);
      try {
        admin = await prisma.adminUser.create({
          data: {
            email,
            password: hashedPassword,
            name: "MM Laptop Center Admin",
          },
        });
      } catch {
        admin = await prisma.adminUser.findFirst({ where: { email } });
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: "No admin account found matching this email address." },
        { status: 404 }
      );
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    await prisma.adminPasswordReset.deleteMany({ where: { email } });
    await prisma.adminPasswordReset.create({
      data: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    try {
      await sendAdminPasswordResetEmail(email, otp);
    } catch (emailErr) {
      console.error("[Admin Password Reset Email Error]:", emailErr);
      return NextResponse.json(
        {
          error: `Failed to send reset email: ${(emailErr as Error).message || "Check email credentials"}.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}. Please check your inbox and spam folder.`,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}