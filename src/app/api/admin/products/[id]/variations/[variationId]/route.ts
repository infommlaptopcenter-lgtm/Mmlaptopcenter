import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const variationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  value: z.string().min(1, "Variation value is required"),
  price: z.number().min(0, "Variation price must be positive"),
});

// PUT /api/admin/products/[id]/variations/[variationId] - Update a variation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; variationId: string }> }
) {
  try {
    await requireAdmin();
    const { id, variationId } = await params;
    const body = await request.json();
    const validated = variationSchema.parse(body);

    const variation = await prisma.productVariation.update({
      where: { id: variationId, productId: id },
      data: validated,
    });

    return NextResponse.json({ variation });
  } catch (error: unknown) {
    console.error("Error updating variation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update variation" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]/variations/[variationId] - Delete a variation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variationId: string }> }
) {
  try {
    await requireAdmin();
    const { id, variationId } = await params;

    await prisma.productVariation.delete({
      where: { id: variationId, productId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting variation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete variation" },
      { status: 500 }
    );
  }
}