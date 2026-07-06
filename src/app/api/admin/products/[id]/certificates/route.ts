import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const certificateSchema = z.object({
  id: z.string().optional(), // For updates
  title: z.string().min(1, "Certificate title is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

// GET /api/admin/products/[id]/certificates - Get all certificates for a product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // @ts-ignore - details field exists in database but types may not be updated
    return NextResponse.json({ certificates: product.certificates || [] });
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates" },
      { status: 401 }
    );
  }
}

// POST /api/admin/products/[id]/certificates - Create or update certificates for a product
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { certificates } = body;

    if (!Array.isArray(certificates)) {
      return NextResponse.json(
        { error: "Certificates must be an array" },
        { status: 400 }
      );
    }

    // Validate each certificate
    const validatedCertificates = certificates.map((c: any) => certificateSchema.parse(c));

    // Update the product with new certificates
    // @ts-ignore - certificates field exists in database but types may not be updated
    const product = await prisma.product.update({
      where: { id },
      data: { certificates: validatedCertificates },
    });

    // @ts-ignore
    return NextResponse.json({ certificates: product.certificates });
  } catch (error: unknown) {
    console.error("Error saving certificates:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save certificates" },
      { status: 500 }
    );
  }
}