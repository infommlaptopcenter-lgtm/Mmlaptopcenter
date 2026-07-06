import { prisma } from "@/lib/prisma";
import { getSitePage } from "@/lib/site-settings";
import type { Prisma } from "@prisma/client";

const DEFAULT_CURRENCY = "PKR";
const DEFAULT_PAGE_SIZE = 12;
const PLACEHOLDER_IMAGE = "/logo/mmlaptop.png";

type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

type StorefrontImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

type ProductCardNode = {
  id: string;
  handle: string;
  title: string;
  tags?: string[];
  featuredImage: StorefrontImage | null;
  images: {
    nodes: StorefrontImage[];
  };
  priceRange: {
    minVariantPrice: MoneyV2;
  };
};

type ProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  seo: {
    title: string;
    description: string;
  };
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  featuredImage: StorefrontImage | null;
  images: {
    nodes: StorefrontImage[];
  };
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      price: MoneyV2;
      compareAtPrice: MoneyV2 | null;
      selectedOptions: {
        name: string;
        value: string;
      }[];
      image: {
        id: string;
      } | null;
      sku?: string | null;
    }[];
  };
  variations: {
    id: string;
    name: string;
    value: string;
    price: MoneyV2;
  }[];
  vendor: string;
  productType: string | null;
  tags: string[];
  metafields: Array<{ key: string; value: string }>;
  recommendations: ProductCardNode[];
};

type CollectionNode = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml?: string | null;
  seo?: {
    title: string;
    description: string;
  };
  image: StorefrontImage | null;
};

type Connection<T> = {
  pageInfo: {
    hasNextPage: boolean;
  };
  edges: Array<{
    cursor: string;
    node: T;
  }>;
};

function parseStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toMoney(amount: number | null | undefined): MoneyV2 {
  return {
    amount: Number(amount ?? 0).toFixed(2),
    currencyCode: DEFAULT_CURRENCY,
  };
}

function toImage(url: string | null | undefined, fallbackId: string): StorefrontImage | null {
  if (!url) {
    return null;
  }

  return {
    id: fallbackId,
    url,
    altText: null,
    width: 1200,
    height: 1200,
  };
}

function buildProductCardNode(product: {
  id: string;
  handle: string;
  title: string;
  price: number;
  featuredImage: string | null;
  images: Prisma.JsonValue;
  tags: Prisma.JsonValue;
}): ProductCardNode {
  const imageUrls = parseStringArray(product.images);
  const images = imageUrls
    .map((url, index) => toImage(url, `${product.id}-image-${index}`))
    .filter((image): image is StorefrontImage => Boolean(image));
  const featuredImage = toImage(
    product.featuredImage ?? imageUrls[0] ?? PLACEHOLDER_IMAGE,
    `${product.id}-featured`,
  );

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    tags: parseStringArray(product.tags),
    featuredImage,
    images: {
      nodes: images,
    },
    priceRange: {
      minVariantPrice: toMoney(product.price),
    },
  };
}

async function buildRecommendations(
  product: {
    handle: string;
    collectionIds: Prisma.JsonValue;
  },
  limit = 4,
) {
  const collectionIds = parseStringArray(product.collectionIds);
  const recommended = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      availableForSale: true,
      handle: {
        not: product.handle,
      },
    },
    take: 12,
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      handle: true,
      title: true,
      price: true,
      featuredImage: true,
      images: true,
      tags: true,
      collectionIds: true,
    },
  });

  return recommended
    .map((item) => ({
      item,
      score: parseStringArray(item.collectionIds).some((id) => collectionIds.includes(id))
        ? 1
        : 0,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ item }) => buildProductCardNode(item));
}

async function buildProductNode(product: {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  inventory: number;
  availableForSale: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: Prisma.JsonValue;
  featuredImage: string | null;
  productType: string | null;
  vendor: string;
  tags: Prisma.JsonValue;
  collectionIds: Prisma.JsonValue;
  variations: Array<{
    id: string;
    name: string;
    value: string;
    price: number;
  }>;
}) {
  const imageUrls = parseStringArray(product.images);
  const images = imageUrls
    .map((url, index) => toImage(url, `${product.id}-image-${index}`))
    .filter((image): image is StorefrontImage => Boolean(image));

  const fallbackImage = toImage(
    product.featuredImage ?? PLACEHOLDER_IMAGE,
    `${product.id}-featured`,
  );
  if (fallbackImage && !images.length) {
    images.push(fallbackImage);
  }

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    seo: {
      title: product.seoTitle ?? product.title,
      description: product.seoDescription ?? product.description ?? product.title,
    },
    priceRange: {
      minVariantPrice: toMoney(product.price),
    },
    featuredImage:
      toImage(
        product.featuredImage ?? images[0]?.url ?? null,
        `${product.id}-featured`,
      ) ?? null,
    images: {
      nodes: images,
    },
    options: [],
    variants: {
      nodes: [
        {
          id: product.id,
          availableForSale: product.availableForSale && product.inventory > 0,
          price: toMoney(product.price),
          compareAtPrice: product.compareAtPrice ? toMoney(product.compareAtPrice) : null,
          selectedOptions: [],
          image: images[0] ? { id: images[0].id } : null,
          sku: product.sku,
        },
      ],
    },
    vendor: product.vendor,
    productType: product.productType,
    tags: parseStringArray(product.tags),
    variations: product.variations.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      price: toMoney(v.price),
    })),
    metafields: [
      { key: "vendor", value: product.vendor },
      { key: "sku", value: product.sku ?? "N/A" },
      { key: "inventory", value: String(product.inventory) },
      { key: "productType", value: product.productType ?? "General" },
    ],
    recommendations: await buildRecommendations(product),
  } satisfies ProductNode;
}

function buildCollectionNode(collection: {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  image: string | null;
}): CollectionNode {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    descriptionHtml: collection.descriptionHtml,
    seo: {
      title: collection.seoTitle ?? collection.title,
      description:
        collection.seoDescription ?? collection.description ?? collection.title,
    },
    image: toImage(collection.image, `${collection.id}-image`),
  };
}

function toConnection<T>(items: T[], skip: number, totalCount: number): Connection<T> {
  return {
    pageInfo: {
      hasNextPage: skip + items.length < totalCount,
    },
    edges: items.map((node, index) => ({
      cursor: String(skip + index + 1),
      node,
    })),
  };
}

function parseCursor(cursor?: string | null) {
  const parsed = Number(cursor ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function getProduct(handle: string) {
  const product = await prisma.product.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
      descriptionHtml: true,
      price: true,
      compareAtPrice: true,
      sku: true,
      inventory: true,
      availableForSale: true,
      seoTitle: true,
      seoDescription: true,
      images: true,
      featuredImage: true,
      productType: true,
      vendor: true,
      tags: true,
      collectionIds: true,
      status: true,
      variations: {
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
        },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return null;
  }

  return buildProductNode(product);
}

export async function getAllProducts(cursor?: string, take = DEFAULT_PAGE_SIZE) {
  const skip = parseCursor(cursor);
  const where = {
    status: "ACTIVE",
  } as const;

  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        handle: true,
        title: true,
        price: true,
        featuredImage: true,
        images: true,
        tags: true,
      },
    }),
  ]);

  return toConnection(
    products.map((product) => buildProductCardNode(product)),
    skip,
    totalCount,
  );
}

export async function getCollection(handle: string) {
  const collection = await prisma.collection.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
      descriptionHtml: true,
      seoTitle: true,
      seoDescription: true,
      image: true,
      productHandles: true,
    },
  });

  if (!collection) {
    return null;
  }

  return buildCollectionNode(collection);
}

export async function getAllCollections(cursor?: string, take = DEFAULT_PAGE_SIZE) {
  const skip = parseCursor(cursor);
  const [totalCount, collections] = await Promise.all([
    prisma.collection.count(),
    prisma.collection.findMany({
      skip,
      take,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        handle: true,
        title: true,
        description: true,
        descriptionHtml: true,
        seoTitle: true,
        seoDescription: true,
        image: true,
      },
    }),
  ]);

  return toConnection(
    collections.map((collection) => buildCollectionNode(collection)),
    skip,
    totalCount,
  );
}

export async function getCollectionProducts(
  handle: string,
  cursor?: string,
  take = DEFAULT_PAGE_SIZE,
) {
  const collection = await prisma.collection.findUnique({
    where: { handle },
    select: {
      productHandles: true,
    },
  });

  if (!collection) {
    return null;
  }

  const productHandles = parseStringArray(collection.productHandles);
  const skip = parseCursor(cursor);
  const pagedHandles = productHandles.slice(skip, skip + take);

  const products = await prisma.product.findMany({
    where: {
      handle: {
        in: pagedHandles,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
      price: true,
      featuredImage: true,
      images: true,
      tags: true,
    },
  });

  const orderedProducts = pagedHandles
    .map((productHandle) => products.find((product) => product.handle === productHandle))
    .filter((product): product is (typeof products)[number] => Boolean(product))
    .map((product) => buildProductCardNode(product));

  return toConnection(orderedProducts, skip, productHandles.length);
}

export async function searchProducts(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { description: { contains: normalizedQuery, mode: "insensitive" } },
        { seoTitle: { contains: normalizedQuery, mode: "insensitive" } },
        { seoDescription: { contains: normalizedQuery, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
      price: true,
      featuredImage: true,
      images: true,
      tags: true,
    },
  });

  return products
    .filter((product) => {
      const tags = parseStringArray(product.tags);
      return (
        product.title.toLowerCase().includes(normalizedQuery) ||
        (product.description ?? "").toLowerCase().includes(normalizedQuery) ||
        tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    })
    .slice(0, 10)
    .map((product) => buildProductCardNode(product));
}

export async function getPage(handle: string) {
  return getSitePage(handle);
}

export const storefront = {
  query: async () => {
    throw new Error("Legacy storefront queries have been removed.");
  },
  mutation: async () => {
    throw new Error("Legacy storefront mutations have been removed.");
  },
};
