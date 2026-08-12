import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { withExactVariationNames } from "@/lib/order-items";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerAddress: true,
        items: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        total: true,
        discount: true,
        couponCode: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentProofUrl: true,
        transactionReference: true,
        confirmationEmailSentAt: true,
        orderStatus: true,
        notes: true,
        trackingNumber: true,
        trackingUrl: true,
        courierName: true,
        estimatedDelivery: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ ...order, items: await withExactVariationNames(order.items) });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const order = await prisma.order.update({ where: { id }, data: body });
    return NextResponse.json(order);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
