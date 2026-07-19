import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductSingle } from "./product-single";
import { getProductSingle } from "./service";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbSchema, createSeoMetadata } from "@/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const product = await getProductSingle(handle);

    return createSeoMetadata({
      title: `${product.seo.title} Pakistan`,
      description: product.seo.description,
      path: `/products/${handle}`,
      image: product.featuredImage?.url,
      keywords: [product.title, `${product.title} Pakistan`, product.productType || "Laptops Pakistan", ...product.tags],
    });
  } catch {
    return createSeoMetadata({ title: "Product Not Found", description: "This product is not available.", path: `/products/${handle}`, noIndex: true });
  }
}

export default async function Page({ params }: Props) {
  const { handle } = await params;
  try {
    const data = await getProductSingle(handle);

    const [reviews, category] = await Promise.all([
      prisma.review.findMany({
        where: { status: "approved", OR: [{ productId: data.id }, { productHandle: data.handle }] },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { authorName: true, rating: true, content: true, createdAt: true },
      }),
      data.categoryId
        ? prisma.category.findUnique({ where: { id: data.categoryId }, select: { name: true, slug: true } })
        : Promise.resolve(null),
    ]);
    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : null;
    const productUrl = absoluteUrl(`/products/${handle}`);
    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      url: productUrl,
      name: data.title,
      image: data.images?.nodes?.map((img) => ({ "@type": "ImageObject", url: img.url, caption: img.altText || data.title })) || [],
      description: data.description || data.seo.description,
      sku: data.variants?.nodes?.[0]?.sku || undefined,
      brand: { "@type": "Brand", name: data.vendor || "MM Laptop Center" },
      category: category?.name || data.productType || "Laptops",
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: data.priceRange.minVariantPrice.currencyCode,
        price: data.priceRange.minVariantPrice.amount,
        itemCondition: "https://schema.org/NewCondition",
        availability: data.variants?.nodes?.[0]?.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@id": "https://mmlaptopcenter.com/#organization" },
      },
      ...(averageRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: averageRating.toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 } } : {}),
      review: reviews.map((review) => ({
        "@type": "Review",
        datePublished: review.createdAt.toISOString(),
        reviewBody: review.content,
        author: { "@type": "Person", name: review.authorName },
        reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
      })),
      isRelatedTo: data.recommendations.map((item) => ({ "@type": "Product", name: item.title, url: absoluteUrl(`/products/${item.handle}`) })),
    };

    const breadcrumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Laptops Pakistan", path: "/products" },
      ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
      { name: data.title, path: `/products/${handle}` },
    ]);

    return (
      <>
        <JsonLd data={[productLd, breadcrumbs]} />
        <ProductSingle data={data} />
      </>
    );
  } catch {
    notFound();
  }
}

