import { getProduct } from "@/lib/storefront";
import { invariant } from "@esmate/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProductSingle(handle: string) {
  const product = await getProduct(handle);
  invariant(product, "product is not available");

  // Fetch custom fields from Prisma (variations, details, certificates)
  const customData = await prisma.product.findUnique({
    where: { handle },
    include: {
      variations: true,
    },
  }) as {
    variations: Array<{
      id: string;
      name: string;
      value: string;
      price: number;
      productId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    details: Array<{ id: string; title: string; description: string; image?: string }>;
    certificates: Array<{ id: string; title: string; description: string; image?: string }>;
  } | null;

  // Transform variations to match the expected format with Money-like price
  const transformedVariations = (customData?.variations || []).map((v) => ({
    ...v,
    price: {
      amount: v.price.toString(),
      currencyCode: product.priceRange?.minVariantPrice?.currencyCode || "PKR",
    },
  }));

  // Merge custom data with Shopify product
  return {
    ...product,
    variations: transformedVariations,
    details: customData?.details || [],
    certificates: customData?.certificates || [],
  };
}

