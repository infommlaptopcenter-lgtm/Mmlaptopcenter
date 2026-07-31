import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CollectionProductList } from "./collection-product-list";
import { getCollection, getCollectionProducts } from "./service";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbSchema, createSeoMetadata } from "@/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle: routeHandle } = await params;
  const collectionHandle = routeHandle;

  try {
    const collection = await getCollection(collectionHandle);
    return createSeoMetadata({
      title: collection.seo?.title ?? `${collection.title} Pakistan`,
      description: collection.seo?.description || collection.description || `Shop ${collection.title} in Pakistan from MM Laptop Center Charsadda with nationwide delivery.`,
      path: `/collections/${collectionHandle}`,
      image: collection.image?.url,
      keywords: [collection.title, `${collection.title} Pakistan`, "Buy Laptop Pakistan"],
    });
  } catch {
    return createSeoMetadata({ title: "Collection Not Found", description: "This collection is not available.", path: `/collections/${collectionHandle}`, noIndex: true });
  }
}

export default async function Page({ params }: Props) {
  const { handle: routeHandle } = await params;
  const collectionHandle = routeHandle;

  let collection;
  let products;

  try {
    // Fetch parallel
    [collection, products] = await Promise.all([
      getCollection(collectionHandle),
      getCollectionProducts(collectionHandle),
    ]);
  } catch {
    notFound();
  }

  const productCount = products.edges.length;
  const heroImage = collection.image?.url;

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <JsonLd data={[
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Collections", path: "/collections" }, { name: collection.title, path: `/collections/${collectionHandle}` }]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: collection.title,
          description: collection.description || `Shop ${collection.title} in Pakistan.`,
          url: absoluteUrl(`/collections/${collectionHandle}`),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: productCount,
            itemListElement: products.edges.map((edge, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: edge.node.title,
              url: absoluteUrl(`/products/${edge.node.handle}`),
            })),
          },
        },
      ]} />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff7df] via-[#fcf5e8] to-[#f4e2b7] text-[#172533]">
        {heroImage && (
          <Image
            src={heroImage}
            alt={collection.image?.altText || collection.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fff7df]/95 via-[#fcf5e8]/85 to-[#f4e2b7]/55" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#d8a928]/15 blur-3xl" />
        <div className="absolute -right-16 top-0 h-72 w-72 rounded-full bg-[#f6a45d]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b57910]">
              MM Laptop Center Collection
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5A5E55] sm:text-lg">
              {collection.description ||
                "Explore carefully selected laptops, gaming gear, and accessories from MM Laptop Center."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-[#d8a928] px-4 py-2 text-white shadow-sm">
                {productCount} product{productCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full bg-white/80 px-4 py-2 text-[#6b4b0b] shadow-sm">
                Fast local support
              </span>
              <span className="rounded-full bg-white/80 px-4 py-2 text-[#6b4b0b] shadow-sm">
                Secure checkout
              </span>
            </div>
          </div>
        </div>
      </section>

      <CollectionProductList handle={collectionHandle} data={products} />
    </main>
  );
}

