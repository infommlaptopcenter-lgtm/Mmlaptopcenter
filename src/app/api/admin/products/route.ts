import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().optional(),
  sku: z.string().optional(),
  inventory: z.number().int().min(0, "Inventory must be non-negative"),
  availableForSale: z.boolean().default(true),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  featuredImage: z.string().optional(),
  productType: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  vendor: z.string().default("MM Laptop Center"),
  tags: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  details: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Detail title is required"),
    description: z.string().optional(),
    image: z.string().optional(),
  })).default([]),
  certificates: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Certificate title is required"),
    description: z.string().optional(),
    image: z.string().optional(),
  })).default([]),
  variations: z.array(z.object({
    name: z.string().min(1, "Variation name is required"),
    value: z.string().min(1, "Variation value is required"),
    price: z.number().min(0, "Variation price must be positive"),
  })).default([]),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { handle: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validated = productSchema.parse(body);

    const { variations, details, certificates, ...productData } = validated;

    if (!productData.categoryId) delete (productData as any).categoryId;
    if (!productData.subcategoryId) delete (productData as any).subcategoryId;

    const product = await prisma.product.create({
      data: {
        ...productData,
        details: details,
        certificates: certificates,
        variations: variations?.length
          ? {
              create: variations.map((v) => ({
                name: v.name,
                value: v.value,
                price: v.price,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create product" },
      { status: 500 }
    );
  }
}