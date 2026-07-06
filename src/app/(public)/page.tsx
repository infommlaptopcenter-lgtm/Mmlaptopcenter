import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HomeHeroSection } from "./_components/HomeHeroSection";
import { HomeContentSections } from "./_components/HomeContentSections";

export const dynamic = "force-dynamic";

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
  "@type": "Organization",
  "name": "MM Laptop Center",
  "url": "https://mmlaptopcenter.com",
  "logo": "https://mmlaptopcenter.com/images/logo.png",
  "sameAs": [
    "https://www.facebook.com/mmlaptopcenter",
    "https://www.instagram.com/mmlaptopcenter",
    "https://twitter.com/mmlaptopcenter"
  ]
};

export const metadata: Metadata = {
  title: "MM Laptop Center – Premium Laptops & Tech",
  description:
    "MM Laptop Center – Shop premium laptops, gaming gear and accessories",
  keywords: [
    "laptops",
    "gaming laptops",
    "business laptops",
    "ultrabooks",
    "budget laptops",
    "laptop accessories",
    "monitors",
    "keyboards",
    "mice",
    "laptop bags",
    "MM Laptop Center",
    "tech store Pakistan",
  ],
  openGraph: {
    title: "MM Laptop Center – Premium Laptops & Tech",
    description:
      "Shop premium laptops, gaming gear and accessories at MM Laptop Center.",
    url: "https://mmlaptopcenter.com",
    siteName: "MM Laptop Center",
    type: "website",
    images: ["https://placehold.co/1400x600?text=MM+Laptop+Center"],
  },
  alternates: {
    canonical: "https://mmlaptopcenter.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Page() {
   const [categories, allProducts, featuredCollections, featuredBlogs, essenceSection] = await Promise.all([
     safeHomeQuery(
       "categories",
       () => prisma.category.findMany({
         where: { parentId: null },
         orderBy: { order: "asc" },
         select: { id: true, name: true, slug: true, image: true },
       }),
       [],
     ),
safeHomeQuery(
       "all products",
       () => prisma.product.findMany({
         where: { status: "ACTIVE" },
         orderBy: { updatedAt: "desc" },
         take: 40,
         select: { id: true, handle: true, title: true, price: true, compareAtPrice: true, featuredImage: true, images: true, tags: true, categoryId: true, subcategoryId: true, isFeatured: true, createdAt: true, updatedAt: true },
       }),
       [],
     ),
    safeHomeQuery(
      "featured collections",
      () => prisma.collection.findMany({
        where: { isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { id: true, handle: true, title: true, image: true },
      }),
      [],
    ),
    safeHomeQuery(
      "featured blogs",
      () => prisma.blogPost.findMany({
        where: { status: "published", isFeatured: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, content: true },
      }),
      [],
    ),
    safeHomeQuery(
      "essence section",
      () => prisma.homepageSection.findUnique({
        where: { sectionKey: "essence" },
      }),
      null,
    ),

  ]);

return (
       <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        <div className="flex flex-col bg-gray-50">
          <HomeHeroSection />
          <h1 className="sr-only">MM Laptop Center – Premium Laptops, Gaming Gear & Tech Accessories</h1>

          <HomeContentSections
            categories={categories}
            products={allProducts}
            collections={featuredCollections}
            featuredBlogs={featuredBlogs}
          />
      </div>
    </>
  );
}
