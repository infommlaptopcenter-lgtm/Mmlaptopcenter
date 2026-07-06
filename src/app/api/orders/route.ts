import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderCreateSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10, "Phone number is required and must be at least 10 digits"),
  customerAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  notes: z.string().optional(),
});

function generateOrderNumber() {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `OC-${ts}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = orderCreateSchema.parse(body);

    const ids = Array.from(new Set(input.items.map((i) => i.productId)));

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        price: true,
        inventory: true,
        availableForSale: true,
        status: true,
        featuredImage: true,
        images: true,
      },
    });

    const productById = new Map(products.map((p) => [p.id, p]));

    // Validate items against DB snapshot
    const enrichedItems = input.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new Error("One or more products are not available. Please check if all products are active.");
      }
      if (!product.availableForSale) {
        throw new Error(`Product not available for sale: ${product.title}`);
      }
      // if (product.inventory < item.quantity) {
      //   throw new Error(`Insufficient inventory for ${product.title}. Available: ${product.inventory}`);
      // }
      const images = Array.isArray(product.images)
        ? (product.images as unknown[]).filter((x): x is string => typeof x === "string")
        : [];

      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.featuredImage ?? images[0] ?? null,
      };
    });

    const subtotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost + tax - discount;

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Best-effort inventory decrement: do not block order confirmation on stock gaps.
      for (const item of enrichedItems) {
        await tx.product.updateMany({
          where: { id: item.productId, inventory: { gte: item.quantity } },
          data: { inventory: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          items: enrichedItems,
          subtotal,
          shippingCost,
          tax,
          total,
          discount,
          paymentMethod: "cod",
          paymentStatus: "pending",
          orderStatus: "pending",
          notes: input.notes,
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to place order" },
      { status: 400 },
    );
  }
}

