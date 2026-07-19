import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from "@esmate/shadcn/pkgs/lucide-react"
import { Metadata } from "next"
import DOMPurify from "dompurify"
import { JsonLd } from "@/components/seo/json-ld"
import { absoluteUrl, breadcrumbSchema, createSeoMetadata } from "@/lib/seo"

interface Props {
  params: Promise<{
    blogHandle: string
    articleHandle: string
  }>
}

export const dynamic = "force-dynamic"

/* ===========================
   SEO METADATA
=========================== */
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { articleHandle } = await params
  const article = await prisma.blogPost.findUnique({
    where: { slug: articleHandle },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      featuredImage: true,
      publishedAt: true,
      author: true,
      tags: true,
      updatedAt: true,
    },
  })

  if (!article) {
    return createSeoMetadata({ title: "Article Not Found", description: "This article is not available.", path: `/blogs/news/${articleHandle}`, noIndex: true })
  }

  const tags = Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === "string") : []
  return createSeoMetadata({
    title: article.seoTitle || `${article.title} Pakistan`,
    description: article.seoDescription || article.excerpt || `${article.title}: laptop buying advice and tech guidance for Pakistan from MM Laptop Center.`,
    path: `/blogs/news/${articleHandle}`,
    type: "article",
    image: article.featuredImage,
    keywords: [article.title, ...tags],
    publishedTime: article.publishedAt?.toISOString(),
    modifiedTime: article.updatedAt.toISOString(),
    authors: article.author ? [article.author] : [],
  })
}

/* ===========================
   PAGE
=========================== */
export default async function ArticlePage({ params }: Props) {
  const { articleHandle } = await params
  const article = await prisma.blogPost.findFirst({
    where: { slug: articleHandle, status: "published" },
    select: {
      title: true,
      content: true,
      featuredImage: true,
      publishedAt: true,
      author: true,
      excerpt: true,
      categoryId: true,
      updatedAt: true,
    },
  })

  if (!article) {
    notFound()
  }

  const cleanHtml = DOMPurify.sanitize(article.content ?? "")
  const [category, relatedProducts] = await Promise.all([
    article.categoryId
      ? prisma.category.findUnique({ where: { id: article.categoryId }, select: { name: true, slug: true } })
      : Promise.resolve(null),
    article.categoryId
      ? prisma.product.findMany({ where: { status: "ACTIVE", OR: [{ categoryId: article.categoryId }, { subcategoryId: article.categoryId }] }, take: 4, select: { title: true, handle: true } })
      : Promise.resolve([]),
  ])
  const articlePath = `/blogs/news/${articleHandle}`

  return (
    <article className="bg-background">
      <JsonLd data={[
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Laptop Guides", path: "/blogs" },
          ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
          { name: article.title, path: articlePath },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${absoluteUrl(articlePath)}#article`,
          headline: article.title,
          description: article.excerpt || undefined,
          image: article.featuredImage ? [article.featuredImage] : undefined,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          mainEntityOfPage: absoluteUrl(articlePath),
          author: { "@type": "Person", name: article.author },
          publisher: { "@id": "https://mmlaptopcenter.com/#organization" },
          about: [
            ...(category ? [{ "@type": "Thing", name: category.name, url: absoluteUrl(`/category/${category.slug}`) }] : []),
            ...relatedProducts.map((product) => ({ "@type": "Product", name: product.title, url: absoluteUrl(`/products/${product.handle}`) })),
          ],
        },
      ]} />
      {(category || relatedProducts.length > 0) && (
        <nav aria-label="Related laptop resources" className="sr-only">
          {category ? <Link href={`/category/${category.slug}`}>{category.name}</Link> : null}
          {relatedProducts.map((product) => <Link key={product.handle} href={`/products/${product.handle}`}>{product.title}</Link>)}
        </nav>
      )}
      {/* ================= HERO IMAGE ================= */}
      {article.featuredImage && (
        <div className="relative w-full h-[60vh] sm:h-[100vh] overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto w-full lg:max-w-3xl">
          {/* Title */}
          <h1 className="text-center text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex justify-center">
            <time
              dateTime={article.publishedAt?.toISOString() ?? undefined}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Calendar className="h-4 w-4" />
              {new Date(article.publishedAt || Date.now()).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>

          {/* Content */}
          <div
            className="
              mt-12 prose prose-lg max-w-none
              prose-headings:font-serif
              prose-headings:tracking-tight
              prose-headings:text-foreground
              prose-p:text-muted-foreground
              prose-p:leading-7
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-blockquote:border-l-primary
              prose-blockquote:text-muted-foreground
              prose-li:text-muted-foreground
              dark:prose-invert
            "
          >
            <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
          </div>

          {/* Back */}
          <div className="mt-16 text-center">
            <Link
              href="/blogs"
              className="text-primary hover:underline underline-offset-4"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>

    </article>
  )
}

