import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

const schema = z.object({
  orderStatus: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "verified", "failed", "refunded"]).optional(),
  trackingNumber: z.string().max(120).optional(),
  trackingUrl: z.union([z.string().url(), z.literal("")]).optional(),
  courierName: z.string().max(120).optional(),
  estimatedDelivery: z.union([z.string().date(), z.literal("")]).optional(),
  notes: z.string().max(5000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = schema.parse(await request.json());
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const { estimatedDelivery, ...fields } = input;
    const order = await prisma.order.update({ where: { id }, data: { ...fields, estimatedDelivery: estimatedDelivery ? new Date(`${estimatedDelivery}T12:00:00.000Z`) : null } });
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid order update", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.customerEmail) return NextResponse.json({ error: "This customer did not provide an email address." }, { status: 400 });
    await sendOrderConfirmationEmail(order);
    const updated = await prisma.order.update({ where: { id }, data: { confirmationEmailSentAt: new Date() } });
    return NextResponse.json({ confirmationEmailSentAt: updated.confirmationEmailSentAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Email failed" }, { status: 500 });
  }
}
