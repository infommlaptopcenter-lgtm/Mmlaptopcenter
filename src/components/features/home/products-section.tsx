"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { StoreProductCard } from "@/components/features/products/store-product-card-wrapper";

const FALLBACK_IMAGE = "/logo/mmlaptop.png";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface Product {
  id: string;
  handle: string;
  title: string;
  price: number | null;
  compareAtPrice: number | null;
  featuredImage: string | null;
  images: any;
  tags: any;
  categoryId: string | null;
  subcategoryId: string | null;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Collection {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  isFeatured?: boolean;
  productHandles?: string[];
}

function ProductGrid({ products, title, bgColor = "white" }: { products: Product[]; title: string; bgColor?: string }) {
  if (!products.length) return null;

  const bgClass = bgColor === "gray-50" ? "bg-gray-50" : "bg-white";

  return (
    <section className={`mx-auto w-full max-w-7xl px-6 lg:px-8 py-16 ${bgClass}`}>
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
              featuredImageUrl={product.featuredImage || firstImage || FALLBACK_IMAGE}
              imageUrls={productImageUrls}
              price={{ amount: Number(product.price || 0).toFixed(2), currencyCode: "PKR" }}
              compareAtPrice={product.compareAtPrice ? { amount: Number(product.compareAtPrice).toFixed(2), currencyCode: "PKR" } : null}
              tag={firstTag}
              productId={product.id}
            />
          );
        })}
      </div>
    </section>
  );
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="lg:mx-auto lg:w-full lg:max-w-7xl lg:px-8 bg-white mt-6 relative z-20">
         
      <div className="flex gap-6 overflow-hidden relative">
        <div className="flex gap-6 animate-scroll scrollbar-hide px-6 lg:px-8">
           {[...categories, ...categories].map((category, idx) => (
             <Link
               key={`${category.id}-${idx}`}
               href="/products"
               className="group flex flex-col items-center flex-shrink-0"
             >
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                <Image
                  src={category.image || FALLBACK_IMAGE}
                  alt={category.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
               <span className="mt-2 sm:mt-3 text-center text-xs font-bold uppercase text-gray-800">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
    </section>
  );
}

function CollectionSlider({ collections }: { collections: Collection[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 3;

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCollections = collections || [];
  const totalSlides = Math.ceil(currentCollections.length / itemsPerPage);
  const displayCollections = currentCollections.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  if (displayCollections.length === 0) {
    return null;
  }

  useEffect(() => {
    if (!mounted || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted, totalSlides]);

  return (
    <div className="relative">
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-3 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        {displayCollections.map((collection, i) => (
          <Link
            key={`${collection.id}-${i}-${currentSlide}`}
            href="/products"
            className="group overflow-hidden rounded-2xl border border-[#d8a928]/20 bg-white"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={collection.image || FALLBACK_IMAGE}
                alt={collection.title}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 text-lg font-semibold text-[#0a0a0a]">{collection.title}</div>
          </Link>
        ))}
      </div>
      {totalSlides > 1 && mounted && (
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

export function ProductsSection({ categories, products, collections }: { categories: Category[]; products: Product[]; collections: Collection[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const featuredProducts = products.filter(p => p.isFeatured);
  const productsByHandle = new Map(products.map((product) => [product.handle, product]));

  const getCollectionProducts = (handle: string) => {
    const collection = collections.find((item) => item.handle === handle);
    const productHandles = collection?.productHandles || [];

    return productHandles
      .map((productHandle) => productsByHandle.get(productHandle))
      .filter((product): product is Product => Boolean(product))
      .slice(0, 8);
  };

  const newArrivals = getCollectionProducts("new-arrivals");
  const bestSellers = getCollectionProducts("best-sellers");

  const filteredProducts = selectedCategory
    ? products.filter(p => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat && (p.categoryId === cat.id || p.subcategoryId === cat.id);
      })
    : featuredProducts;

  const otherProducts = selectedCategory
    ? products.filter(p => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat && p.categoryId !== cat.id && p.subcategoryId !== cat.id;
      })
    : [];

  const selectedCat = categories.find(c => c.slug === selectedCategory);

  const productCard = (product: Product) => {
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
        price={{ amount: Number(product.price || 0).toFixed(2), currencyCode: "PKR" }}
        compareAtPrice={product.compareAtPrice ? { amount: Number(product.compareAtPrice).toFixed(2), currencyCode: "PKR" } : null}
        tag={firstTag}
        productId={product.id}
      />
    );
  };

  return (
    <>
      {selectedCategory && filteredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-6 lg:px-8 bg-white py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-gray-900">{selectedCat?.name} Products</h2>
            <button onClick={() => setSelectedCategory("")} className="text-sm font-semibold text-[#f6a45d] hover:underline">
              Clear Filter
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map(productCard)}
          </div>
        </section>
      )}

      {(!selectedCategory || otherProducts.length > 0) && (
        <section className="bg-white mx-auto w-full max-w-7xl px-6 lg:px-8 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              {selectedCategory ? "Other Products" : "Featured Products"}
            </h2>
            <Link href="/products" className="text-sm font-semibold text-[#f6a45d] hover:underline">
              Shop Now
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(selectedCategory ? otherProducts : products).map(productCard)}
          </div>
        </section>
      )}

      <ProductGrid products={newArrivals} title="New Arrivals" bgColor="white" />

      <ProductGrid products={bestSellers} title="Best Sellers" bgColor="gray-50" />

      <section className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-16 bg-gray-50">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex rounded-full bg-[#ffedd5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ea580c]">
            Collections
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Curated Collections
          </h2>
        </div>
        <CollectionSlider collections={collections.filter((collection) => collection.isFeatured !== false)} />
      </section>
    </>
  );
}
