import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  removeCollectionFromProducts,
  syncCollectionProducts,
} from "@/lib/collection-membership";
import type { Prisma } from "@prisma/client";

function stringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

const collectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  image: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  productHandles: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(collection);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const validated = collectionSchema.parse(body);
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { productHandles: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const collection = await prisma.$transaction(async (transaction) => {
      const updatedCollection = await transaction.collection.update({
        where: { id },
        data: validated,
      });

      await syncCollectionProducts(transaction, {
        collectionId: id,
        previousProductHandles: stringArray(existing.productHandles),
        productHandles: validated.productHandles,
      });

      return updatedCollection;
    });
    return NextResponse.json(collection);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.$transaction(async (transaction) => {
      await removeCollectionFromProducts(transaction, id);
      await transaction.collection.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
