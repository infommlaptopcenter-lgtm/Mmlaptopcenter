
"use client";
import Link from "next/link";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Loader2 } from "@esmate/shadcn/pkgs/lucide-react";
import { useState } from "react";
import { getCollectionProducts } from "./service";
import { useRequest } from "@esmate/react/ahooks";
import { titleize } from "@/lib/string-utils";
import { StoreProductCard } from "@/components/features/products/store-product-card-wrapper";

const FALLBACK_IMAGE = "/logo/new logo.png";
type ProductMoney = { amount: string; currencyCode: string };
type ProductNode = Awaited<ReturnType<typeof getCollectionProducts>>["edges"][number]["node"] & {
  compareAtPrice?: ProductMoney | null;
};

interface Props {
  handle: string;
  data: Awaited<ReturnType<typeof getCollectionProducts>>;
}

export function CollectionProductList(props: Props) {
  const [pages, setPages] = useState([props.data]);
  const lastPage = pages[pages.length - 1];
  const lastCursor = lastPage.edges[lastPage.edges.length - 1]?.cursor;
  const hasNextPage = lastPage.pageInfo.hasNextPage;

  const request = useRequest(
    async () => {
      const nextData = await getCollectionProducts(props.handle, lastCursor);
      setPages((currentPages) => [...currentPages, nextData]);
    },
    {
      manual: true,
    },
  );

  const products = pages.flatMap(({ edges }) => edges);

  if (!products.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
        <div className="rounded-2xl border border-orange-100 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
            Coming Soon
          </p>
          <h2 className="mt-3 font-serif text-2xl font-extrabold text-[#ea580c]">
            Products are being added
          </h2>
          <p className="mt-3 text-stone-600">
            This collection is ready, and products will appear here as soon as
            they are published.
          </p>
          <Button asChild className="mt-6 rounded-xl bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Collection products</p>
          <h2 className="mt-2 font-serif text-2xl font-extrabold text-[#ea580c] sm:text-3xl">Shop this collection</h2>
        </div>
        <p className="text-sm font-medium text-stone-600">
          Showing {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(({ node }) => {
          const product = node as ProductNode;
          const imageUrls = node.images.nodes.map((image) => image.url);

          return (
            <StoreProductCard
              key={node.handle}
              handle={node.handle}
              title={titleize(node.title)}
              featuredImageUrl={node.featuredImage?.url || imageUrls[0] || FALLBACK_IMAGE}
              imageUrls={imageUrls}
              price={node.priceRange.minVariantPrice}
              compareAtPrice={product.compareAtPrice}
              tag={node.tags?.[0]}
              productId={node.id}
            />
          );
        })}
      </div>

      {hasNextPage && (
        <div className="mt-12 flex justify-center ">
          <Button
            size="lg"
            variant={request.error ? "destructive" : "default"}
            onClick={request.run}
            disabled={request.loading}
            className="min-w-50 cursor-pointer rounded-xl bg-orange-500 text-white hover:bg-orange-600"
          >
            {request.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {request.loading ? "Loading..." : request.error ? "Try Again" : "Load More Products"}
          </Button>
        </div>
      )}
    </section>
  );
}

