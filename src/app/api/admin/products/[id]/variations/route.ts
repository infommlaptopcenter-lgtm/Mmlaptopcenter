import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const variationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  value: z.string().min(1, "Variation value is required"),
  price: z.number().min(0, "Variation price must be positive"),
});

// GET /api/admin/products/[id]/variations - Get all variations for a product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const variations = await prisma.productVariation.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ variations });
  } catch (error: any) {
    console.error("Error fetching variations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch variations" },
      { status: 401 }
    );
  }
}

// POST /api/admin/products/[id]/variations - Replace all variations for a product
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { variations } = body;

    if (!Array.isArray(variations)) {
      return NextResponse.json(
        { error: "Variations must be an array" },
        { status: 400 }
      );
    }

    const validatedVariations = variations.map((v: any) => variationSchema.parse(v));

    await prisma.productVariation.deleteMany({
      where: { productId: id },
    });

    const created = await prisma.productVariation.createMany({
      data: validatedVariations.map((v: any) => ({
        ...v,
        productId: id,
      })),
    });

    const newVariations = await prisma.productVariation.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ variations: newVariations }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error saving variations:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save variations" },
      { status: 500 }
    );
  }
}