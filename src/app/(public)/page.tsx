import { prisma } from "@/lib/prisma";
import { serializeVideo } from "@/lib/video-utils";
import { HomeHeroSection } from "./_components/HomeHeroSection";
import { HomeContentSections } from "./_components/HomeContentSections";
import { createSeoMetadata } from "@/lib/seo";

export const revalidate = 60;

async function safeHomeQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`Using fallback for home page ${label}: ${message}`);
    return fallback;
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://mmlaptopcenter.com/#website",
  name: "MM Laptop Center",
  url: "https://mmlaptopcenter.com",
  publisher: { "@id": "https://mmlaptopcenter.com/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://mmlaptopcenter.com/products?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export const metadata = createSeoMetadata({
  title: "Laptop Store Pakistan – MM Laptop Center Charsadda",
  description:
    "Buy laptops in Pakistan from MM Laptop Center Charsadda. Shop gaming laptops, business laptops, Apple MacBooks, Windows laptops and accessories with nationwide delivery.",
  path: "/",
  keywords: [
    "Laptop Store Pakistan",
    "Buy Laptop Pakistan",
    "Laptop Shop Charsadda",
    "Gaming Laptops Pakistan",
    "Apple MacBook Pakistan",
  ],
});

export default async function Page() {
  const [
    categories,
    featuredCollections,
    featuredBlogs,
    homeVideos,
    reviewGroups,
    recentProducts,
  ] = await Promise.all([
    safeHomeQuery(
      "categories",
      () =>
        prisma.category.findMany({
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            parentId: true,
            order: true,
          },
        }),
      [],
    ),
    safeHomeQuery(
      "featured collections",
      () =>
        prisma.collection.findMany({
          where: {
            OR: [
              { isFeatured: true },
              { handle: { in: ["new-arrivals", "best-sellers"] } },
            ],
          },
          orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
          take: 20,
          select: {
            id: true,
            handle: true,
            title: true,
            image: true,
            isFeatured: true,
            productHandles: true,
          },
        }),
      [],
    ),
    safeHomeQuery(
      "featured blogs",
      () =>
        prisma.blogPost.findMany({
          where: { status: "published", isFeatured: true },
          orderBy: { publishedAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            publishedAt: true,
          },
        }),
      [],
    ),
    safeHomeQuery(
      "home videos",
      () =>
        prisma.video.findMany({
          where: { active: true, placement: "HOMEPAGE" },
          orderBy: [
            { featured: "desc" },
            { displayOrder: "asc" },
            { createdAt: "desc" },
          ],
          take: 8,
        }),
      [],
    ),
    safeHomeQuery(
      "product review summaries",
      () =>
        prisma.review.groupBy({
          by: ["productHandle"],
          where: {
            status: "approved",
            productHandle: { not: null },
          },
          _avg: { rating: true },
          _count: { id: true },
        }),
      [],
    ),
    safeHomeQuery(
      "all products",
      () =>
        prisma.product.findMany({
          where: { status: "ACTIVE" },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            handle: true,
            title: true,
            price: true,
            compareAtPrice: true,
            featuredImage: true,
            images: true,
            tags: true,
            collectionIds: true,
            categoryId: true,
            subcategoryId: true,
            isFeatured: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      [],
    ),
  ]);

  const homeCollections = featuredCollections.map((collection) => ({
    ...collection,
    productHandles: [
      ...new Set([
        ...parseStringArray(collection.productHandles),
        ...recentProducts
          .filter((product) =>
            parseStringArray(product.collectionIds).includes(collection.id),
          )
          .map((product) => product.handle),
      ]),
    ],
  }));

  const collectionProductHandles = homeCollections
    .filter((collection) =>
      ["new-arrivals", "best-sellers"].includes(collection.handle),
    )
    .flatMap((collection) => collection.productHandles);

  const collectionProductHandleSet = new Set(collectionProductHandles);
  const collectionProducts = recentProducts.filter((product) =>
    collectionProductHandleSet.has(product.handle),
  );

  const reviewStatsByHandle = new Map(
    reviewGroups
      .filter(
        (
          group,
        ): group is typeof group & {
          productHandle: string;
        } => Boolean(group.productHandle),
      )
      .map((group) => [
        group.productHandle,
        {
          averageRating: group._avg.rating ?? 0,
          totalReviews: group._count.id,
        },
      ]),
  );

  const subcategoryIdsByParentId = categories.reduce((map, category) => {
    if (!category.parentId) return map;
    const ids = map.get(category.parentId) ?? [];
    ids.push(category.id);
    map.set(category.parentId, ids);
    return map;
  }, new Map<string, string[]>());

  const categoryProducts = categories
    .filter((category) => !category.parentId)
    .flatMap((category) => {
      const categoryIds = new Set([
        category.id,
        ...(subcategoryIdsByParentId.get(category.id) ?? []),
      ]);
      return recentProducts
        .filter(
          (product) =>
            (product.categoryId && categoryIds.has(product.categoryId)) ||
            (product.subcategoryId && categoryIds.has(product.subcategoryId)),
        )
        .slice(0, 12);
    });

  const allProducts = Array.from(
    new Map(
      [...collectionProducts, ...categoryProducts].map((product) => [
        product.handle,
        product,
      ]),
    ).values(),
  ).map((product) => ({
    ...product,
    reviewStats: reviewStatsByHandle.get(product.handle) ?? null,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex w-full min-w-0 flex-col overflow-x-clip bg-gray-50">
        <HomeHeroSection />
        <h1 className="sr-only">
          MM Laptop Center – Premium Laptops, Gaming Gear & Tech Accessories
        </h1>

        <HomeContentSections
          categories={categories}
          products={allProducts}
          collections={homeCollections}
          featuredBlogs={featuredBlogs}
          homeVideos={homeVideos.map(serializeVideo)}
        />
      </div>
    </>
  );
}
