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
    <main className="min-h-screen bg-[#fbf7ef]">
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
      <section className="relative overflow-hidden bg-[#1a1308] text-white">
        {heroImage && (
          <Image
            src={heroImage}
            alt={collection.image?.altText || collection.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1308] via-[#1a1308]/85 to-[#1a1308]/50" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f6a45d]">
              MM Laptop Center
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {collection.description ||
                "Explore carefully selected laptops, gaming gear, and accessories from MM Laptop Center."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white px-4 py-2 text-[#1a1308]">
                {productCount} product{productCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-white/25 px-4 py-2 text-white">
                Fast local support
              </span>
              <span className="rounded-full border border-white/25 px-4 py-2 text-white">
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

