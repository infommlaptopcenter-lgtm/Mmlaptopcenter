"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@esmate/shadcn/pkgs/lucide-react";
import { StoreProductCard } from "@/components/features/products/store-product-card-wrapper";

const FALLBACK_IMAGE = "/logo/new logo.png";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image: string | null;
  parentId?: string | null;
  order?: number;
}

export interface HomeProduct {
  id: string;
  handle: string;
  title: string;
  price: number | null;
  compareAtPrice: number | null;
  featuredImage: string | null;
  images: unknown;
  tags: unknown;
  categoryId: string | null;
  subcategoryId: string | null;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
}

interface Collection {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  isFeatured?: boolean;
  productHandles?: string[];
}

function ProductGrid({
  products,
  title,
  bgColor = "white",
}: {
  products: HomeProduct[];
  title: string;
  bgColor?: string;
}) {
  if (!products.length) return null;

  const bgClass = bgColor === "gray-50" ? "bg-gray-50" : "bg-white";

  return (
    <section
      className={`mx-auto w-full max-w-7xl px-6 lg:px-8 py-16 ${bgClass}`}
    >
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="font-serif text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const productImageUrls = Array.isArray(product.images)
            ? product.images.filter((x): x is string => typeof x === "string")
            : [];
          const firstImage = productImageUrls[0] || null;
          const firstTag = Array.isArray(product.tags)
            ? product.tags.find((x): x is string => typeof x === "string")
            : undefined;
          return (
            <StoreProductCard
              key={product.handle}
              handle={product.handle}
              title={product.title}
              featuredImageUrl={
                product.featuredImage || firstImage || FALLBACK_IMAGE
              }
              imageUrls={productImageUrls}
              price={{
                amount: Number(product.price || 0).toFixed(2),
                currencyCode: "PKR",
              }}
              compareAtPrice={
                product.compareAtPrice
                  ? {
                      amount: Number(product.compareAtPrice).toFixed(2),
                      currencyCode: "PKR",
                    }
                  : null
              }
              tag={firstTag}
              productId={product.id}
              initialReviewStats={product.reviewStats}
            />
          );
        })}
      </div>
    </section>
  );
}

export function NewArrivalsSection({
  products,
  collections,
}: {
  products: HomeProduct[];
  collections: Collection[];
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const productsByHandle = new Map(
    products.map((product) => [product.handle, product]),
  );
  const newArrivals = (collections.find(
    (collection) => collection.handle === "new-arrivals",
  )?.productHandles || [])
    .map((handle) => productsByHandle.get(handle))
    .filter((product): product is HomeProduct => Boolean(product));

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || newArrivals.length <= 1) return;

    let frame = 0;
    let previousTime = 0;
    let isPaused = false;
    let isVisible = false;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const move = (time: number) => {
      if (previousTime && isVisible && !isPaused && !reducedMotion) {
        carousel.scrollLeft += ((time - previousTime) / 1000) * 20;
        const loopPoint = carousel.scrollWidth / 2;
        if (carousel.scrollLeft >= loopPoint) carousel.scrollLeft -= loopPoint;
      }
      previousTime = time;
      frame = requestAnimationFrame(move);
    };
    const pause = () => {
      isPaused = true;
    };
    const resume = () => {
      isPaused = false;
      previousTime = performance.now();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        previousTime = performance.now();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(carousel);
    carousel.addEventListener("pointerenter", pause);
    carousel.addEventListener("pointerleave", resume);
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("focusout", resume);
    frame = requestAnimationFrame(move);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      carousel.removeEventListener("pointerenter", pause);
      carousel.removeEventListener("pointerleave", resume);
      carousel.removeEventListener("focusin", pause);
      carousel.removeEventListener("focusout", resume);
    };
  }, [newArrivals.length]);

  if (!newArrivals.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          New Arrivals
        </h2>
      </div>
      <div
        ref={carouselRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 sm:gap-5"
      >
        {[0, 1].map((copy) =>
          newArrivals.map((product) => {
            const imageUrls = Array.isArray(product.images)
              ? product.images.filter((image): image is string => typeof image === "string")
              : [];
            return (
              <Link
                key={`${product.handle}-${copy}`}
                href={`/products/${encodeURIComponent(product.handle)}`}
                tabIndex={copy === 1 ? -1 : undefined}
                aria-hidden={copy === 1}
                aria-label={product.title}
                className="group relative aspect-square w-[calc((100vw-3.5rem)/2)] shrink-0 overflow-hidden rounded-2xl bg-gray-50 sm:w-56 lg:w-64"
              >
                <Image
                  src={product.featuredImage || imageUrls[0] || FALLBACK_IMAGE}
                  alt={product.title}
                  fill
                  sizes="(max-width: 639px) calc((100vw - 3.5rem) / 2), (max-width: 1023px) 224px, 256px"
                  className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-base">
                  {product.title}
                </span>
              </Link>
            );
          }),
        )}
      </div>
    </section>
  );
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const mainCategories = categories.filter((category) => !category.parentId);
  if (!mainCategories.length) return null;

  return (
    <section
      aria-label="Shop by category"
      className="storefront-categories relative z-20 mt-6 overflow-hidden bg-white py-5 lg:mx-auto lg:max-w-7xl"
    >
      <div className="category-marquee scrollbar-hide overflow-x-auto">
        <div className="category-marquee-track w-max">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 gap-8 pr-8 sm:gap-10 sm:pr-10 lg:gap-12 lg:pr-12"
              aria-hidden={copy === 1}
            >
              {mainCategories.map((category) => (
                <Link
                  key={`${category.id}-${copy}`}
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  className="group flex w-32 shrink-0 flex-col items-center sm:w-40 lg:w-48"
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                    <Image
                      src={category.image || FALLBACK_IMAGE}
                      alt={category.name}
                      fill
                      sizes="(max-width: 639px) 128px, (max-width: 1023px) 160px, 192px"
                      className="object-contain transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-3 text-center text-xs font-bold uppercase text-gray-800 sm:text-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductRow({
  title,
  description,
  categorySlug,
  products,
  productCard,
  direction,
}: {
  title: string;
  description?: string | null;
  categorySlug: string;
  products: HomeProduct[];
  productCard: (product: HomeProduct) => React.ReactNode;
  direction: "left" | "right";
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || products.length <= 1) return;
    let frame = 0;
    let previousTime = 0;
    let paused = false;
    let visible = false;
    let documentVisible = document.visibilityState === "visible";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const halfWidth = () => row.scrollWidth / 2;
    if (direction === "right") row.scrollLeft = halfWidth();

    const move = (time: number) => {
      if (
        previousTime &&
        !paused &&
        visible &&
        documentVisible &&
        !reduceMotion
      ) {
        const distance = ((time - previousTime) / 1000) * 22;
        row.scrollLeft += direction === "left" ? distance : -distance;
        const half = halfWidth();
        if (direction === "left" && row.scrollLeft >= half)
          row.scrollLeft -= half;
        if (direction === "right" && row.scrollLeft <= 0)
          row.scrollLeft += half;
      }
      previousTime = time;
      frame = requestAnimationFrame(move);
    };
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
      previousTime = performance.now();
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!row.contains(document.activeElement) && !row.matches(":hover"))
          resume();
      });
    };
    row.addEventListener("pointerenter", pause);
    row.addEventListener("pointerleave", resume);
    row.addEventListener("focusin", pause);
    row.addEventListener("focusout", onFocusOut);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previousTime = performance.now();
      },
      { rootMargin: "200px 0px" },
    );
    const onVisibilityChange = () => {
      documentVisible = document.visibilityState === "visible";
      previousTime = performance.now();
    };
    observer.observe(row);
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = requestAnimationFrame(move);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      row.removeEventListener("pointerenter", pause);
      row.removeEventListener("pointerleave", resume);
      row.removeEventListener("focusin", pause);
      row.removeEventListener("focusout", onFocusOut);
    };
  }, [direction, products.length]);

  if (!products.length) return null;

  return (
    <div className="space-y-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <h3 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-6 text-gray-600 sm:text-base">
            {description}
          </p>
        ) : null}
        <Link
          href={`/category/${encodeURIComponent(categorySlug)}`}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)] transition hover:-translate-y-0.5 hover:border-orange-600 hover:bg-orange-600 hover:shadow-md sm:text-sm"
        >
          Shop Now
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      <div
        ref={rowRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto pb-4"
      >
        {[...products, ...products].map((product, index) => (
          <div
            key={`${product.handle}-${index}`}
            data-product-card
            className="w-[17.5rem] shrink-0 sm:w-[18.5rem] lg:w-[19rem]"
          >
            {productCard(product)}
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionSlider({ collections }: { collections: Collection[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 3;

  const currentCollections = collections || [];
  const totalSlides = Math.ceil(currentCollections.length / itemsPerPage);
  const displayCollections = currentCollections.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage,
  );

  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  if (displayCollections.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 transition-opacity duration-1000 ease-in-out">
        {displayCollections.map((collection, i) => (
          <Link
            key={`${collection.id}-${i}-${currentSlide}`}
            href={`/collections/${encodeURIComponent(collection.handle)}`}
            className="group overflow-hidden rounded-2xl border border-[#d8a928]/20 bg-white"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={collection.image || FALLBACK_IMAGE}
                alt={collection.title}
                fill
                sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) 50vw, 33vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 text-lg font-semibold text-[#0a0a0a]">
              {collection.title}
            </div>
          </Link>
        ))}
      </div>
      {totalSlides > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-6 bg-[#f6a45d]" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductsSection({
  categories,
  products,
  collections,
}: {
  categories: Category[];
  products: HomeProduct[];
  collections: Collection[];
}) {
  const productsByHandle = new Map(
    products.map((product) => [product.handle, product]),
  );
  const mainCategories = categories
    .filter((category) => !category.parentId)
    .sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
    );

  const subcategoryIdsByParentId = categories.reduce((map, category) => {
    if (!category.parentId) return map;
    const ids = map.get(category.parentId) || [];
    ids.push(category.id);
    map.set(category.parentId, ids);
    return map;
  }, new Map<string, string[]>());

  const featuredRows = mainCategories
    .map((category) => {
      const categoryIds = new Set([
        category.id,
        ...(subcategoryIdsByParentId.get(category.id) || []),
      ]);
      const rowProducts = products.filter(
        (product) =>
          (product.categoryId && categoryIds.has(product.categoryId)) ||
          (product.subcategoryId && categoryIds.has(product.subcategoryId)),
      );

      return { category, products: rowProducts };
    })
    .filter((row) => row.products.length > 0);

  const getCollectionProducts = (handle: string) => {
    const collection = collections.find((item) => item.handle === handle);
    const productHandles = collection?.productHandles || [];

    return productHandles
      .map((productHandle) => productsByHandle.get(productHandle))
      .filter((product): product is HomeProduct => Boolean(product))
      .slice(0, 8);
  };

  const bestSellers = getCollectionProducts("best-sellers");

  const productCard = (product: HomeProduct) => {
    const productImageUrls = Array.isArray(product.images)
      ? product.images.filter((x): x is string => typeof x === "string")
      : [];
    const firstImage = productImageUrls[0] || null;
    const firstTag = Array.isArray(product.tags)
      ? product.tags.find((x): x is string => typeof x === "string")
      : undefined;
    return (
      <StoreProductCard
        key={product.handle}
        handle={product.handle}
        title={product.title}
        featuredImageUrl={product.featuredImage || firstImage || FALLBACK_IMAGE}
        imageUrls={productImageUrls}
        price={{
          amount: Number(product.price || 0).toFixed(2),
          currencyCode: "PKR",
        }}
        compareAtPrice={
          product.compareAtPrice
            ? {
                amount: Number(product.compareAtPrice).toFixed(2),
                currencyCode: "PKR",
              }
            : null
        }
        tag={firstTag}
        productId={product.id}
        initialReviewStats={product.reviewStats}
      />
    );
  };

  return (
    <>
      {featuredRows.length > 0 && (
        <section className="bg-white mx-auto w-full max-w-7xl px-6 lg:px-8 py-16">
          <div className="space-y-10">
            {featuredRows.map((row, index) => (
              <FeaturedProductRow
                key={row.category.id}
                title={row.category.name}
                description={row.category.description}
                categorySlug={row.category.slug}
                products={row.products}
                productCard={productCard}
                direction={index % 2 === 0 ? "left" : "right"}
              />
            ))}
          </div>
        </section>
      )}

      <ProductGrid
        products={bestSellers}
        title="Best Sellers"
        bgColor="gray-50"
      />
    </>
  );
}

export function CollectionsSection({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <section className="mx-auto w-full max-w-7xl bg-gray-50 px-6 py-16 lg:px-8">
      <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
        <span className="inline-flex rounded-full bg-[#ffedd5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ea580c]">
          Collections
        </span>
        <h2 className="font-serif text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          Curated Collections
        </h2>
        <Link
          href="/collections"
          className="group inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
        >
          View All Collections
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      <CollectionSlider
        collections={collections.filter(
          (collection) => collection.isFeatured !== false,
        )}
      />
    </section>
  );
}
