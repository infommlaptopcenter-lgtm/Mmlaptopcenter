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
    <main className="min-h-screen bg-[#f4f1e8] text-[#17130d]">
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
      <section className="relative isolate overflow-hidden bg-[#f4f1e8] text-[#17130d]">
        {heroImage && (
          <Image
            src={heroImage}
            alt={collection.image?.altText || collection.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.08] grayscale"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(249,115,22,.14),transparent_40%),linear-gradient(110deg,rgba(244,241,232,.98)_20%,rgba(244,241,232,.78))]" />

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-400">
              MM Laptop Center Collection
            </p>
            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-normal text-[#ea580c] sm:text-6xl lg:text-7xl">
              {collection.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              {collection.description ||
                "Explore carefully selected laptops, gaming gear, and accessories from MM Laptop Center."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-sm">
                {productCount} product{productCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-orange-100 bg-white/70 px-4 py-2 text-stone-700">
                Fast local support
              </span>
              <span className="rounded-full border border-orange-100 bg-white/70 px-4 py-2 text-stone-700">
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

