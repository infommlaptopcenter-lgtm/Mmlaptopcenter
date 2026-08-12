import { prisma } from "@/lib/prisma";

type StoredItem = Record<string, unknown>;

export async function withExactVariationNames(value: unknown) {
  const items = Array.isArray(value) ? value.filter((item): item is StoredItem => !!item && typeof item === "object") : [];
  const ids = items.map((item) => String(item.variationId || item.productId || "")).filter(Boolean);
  if (!ids.length) return items;
  const variations = await prisma.productVariation.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const names = new Map(variations.map((variation) => [variation.id, variation.name]));
  return items.map((item) => {
    const variationName = names.get(String(item.variationId || item.productId || ""));
    return variationName ? { ...item, title: variationName, variationName } : item;
  });
}
