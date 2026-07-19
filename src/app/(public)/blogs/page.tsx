import { prisma } from "@/lib/prisma";
import { BlogPageContent } from "./_components/blog-page-content";
import { createSeoMetadata } from "@/lib/seo";

/* ---------------- SEO METADATA ---------------- */
export const dynamic = "force-dynamic";

/* ---------------- SEO METADATA ---------------- */
export const metadata = createSeoMetadata({
  title: "Laptop Buying Guides Pakistan",
  description: "Laptop buying guides, MacBook advice, gaming and business laptop comparisons, upgrade tips and tech news from MM Laptop Center Pakistan.",
  path: "/blogs",
  keywords: ["Laptop buying guide Pakistan", "MacBook guide Pakistan", "Gaming Laptops Pakistan"],
});

export default async function BlogPage() {
  const articles = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
  });

  return <BlogPageContent articles={articles} />;
}

