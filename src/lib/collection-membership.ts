import type { Prisma } from "@prisma/client";

function stringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export async function syncProductCollections(
  transaction: Prisma.TransactionClient,
  input: {
    productHandle: string;
    previousHandle?: string;
    previousCollectionIds?: string[];
    collectionIds: string[];
  },
) {
  const selectedIds = unique(input.collectionIds);
  const affectedIds = unique([
    ...(input.previousCollectionIds ?? []),
    ...selectedIds,
  ]);

  if (!affectedIds.length) return;

  const collections = await transaction.collection.findMany({
    where: { id: { in: affectedIds } },
    select: { id: true, productHandles: true },
  });

  await Promise.all(
    collections.map((collection) => {
      const handles = stringArray(collection.productHandles).filter(
        (handle) =>
          handle !== input.productHandle && handle !== input.previousHandle,
      );

      if (selectedIds.includes(collection.id)) {
        handles.push(input.productHandle);
      }

      return transaction.collection.update({
        where: { id: collection.id },
        data: { productHandles: unique(handles) },
      });
    }),
  );
}

export async function syncCollectionProducts(
  transaction: Prisma.TransactionClient,
  input: {
    collectionId: string;
    previousProductHandles?: string[];
    productHandles: string[];
  },
) {
  const selectedHandles = unique(input.productHandles);
  const affectedHandles = unique([
    ...(input.previousProductHandles ?? []),
    ...selectedHandles,
  ]);

  if (!affectedHandles.length) return;

  const products = await transaction.product.findMany({
    where: { handle: { in: affectedHandles } },
    select: { id: true, handle: true, collectionIds: true },
  });

  await Promise.all(
    products.map((product) => {
      const collectionIds = stringArray(product.collectionIds).filter(
        (id) => id !== input.collectionId,
      );

      if (selectedHandles.includes(product.handle)) {
        collectionIds.push(input.collectionId);
      }

      return transaction.product.update({
        where: { id: product.id },
        data: { collectionIds: unique(collectionIds) },
      });
    }),
  );
}

export async function removeProductFromCollections(
  transaction: Prisma.TransactionClient,
  productHandle: string,
) {
  const collections = await transaction.collection.findMany({
    select: { id: true, productHandles: true },
  });

  await Promise.all(
    collections
      .filter((collection) =>
        stringArray(collection.productHandles).includes(productHandle),
      )
      .map((collection) =>
        transaction.collection.update({
          where: { id: collection.id },
          data: {
            productHandles: stringArray(collection.productHandles).filter(
              (handle) => handle !== productHandle,
            ),
          },
        }),
      ),
  );
}

export async function removeCollectionFromProducts(
  transaction: Prisma.TransactionClient,
  collectionId: string,
) {
  const products = await transaction.product.findMany({
    select: { id: true, collectionIds: true },
  });

  await Promise.all(
    products
      .filter((product) =>
        stringArray(product.collectionIds).includes(collectionId),
      )
      .map((product) =>
        transaction.product.update({
          where: { id: product.id },
          data: {
            collectionIds: stringArray(product.collectionIds).filter(
              (id) => id !== collectionId,
            ),
          },
        }),
      ),
  );
}
