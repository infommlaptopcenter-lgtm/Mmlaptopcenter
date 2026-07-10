"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, X } from "@esmate/shadcn/pkgs/lucide-react";
import { StoreProductCard } from "@/components/features/products/store-product-card-wrapper";

const FALLBACK_IMAGE = "/logo/mmlaptop.png";
const PRODUCTS_PER_CATEGORY_PAGE = 4;

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  subcategories: Subcategory[];
}

interface Product {
  id: string;
  handle: string;
  title: string;
  price: number | null;
  compareAtPrice: number | null;
  featuredImage: string | null;
  images: unknown;
  tags: unknown;
  description?: string | null;
  sku?: string | null;
  productType?: string | null;
  vendor?: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
}

interface Props {
  categories: Category[];
  initialProducts: Product[];
  initialCategorySlug?: string;
}

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
};

type ProductRow = {
  categoryId: string;
  products: Product[];
};

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function buildCategoryNodes(categories: Category[]) {
  return categories.flatMap<CategoryNode>((category) => [
    {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: null,
      order: category.order,
    },
    ...category.subcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.slug,
      parentId: category.id,
      order: subcategory.order,
    })),
  ]);
}

function ProductCard({ product }: { product: Product }) {
  const productImageUrls = getStringArray(product.images);
  const firstImage = productImageUrls[0] || null;
  const firstTag = getStringArray(product.tags)[0];

  return (
    <StoreProductCard
      handle={product.handle}
      title={product.title}
      featuredImageUrl={product.featuredImage || firstImage || FALLBACK_IMAGE}
      imageUrls={productImageUrls}
      price={{ amount: Number(product.price || 0).toFixed(2), currencyCode: "PKR" }}
      compareAtPrice={
        product.compareAtPrice
          ? { amount: Number(product.compareAtPrice).toFixed(2), currencyCode: "PKR" }
          : null
      }
      tag={firstTag}
      productId={product.id}
    />
  );
}

export function ProductsFiltered({
  categories,
  initialProducts,
  initialCategorySlug = "",
}: Props) {
  const categoryNodes = useMemo(() => buildCategoryNodes(categories), [categories]);
  const initialCategory = categoryNodes.find((category) => category.slug === initialCategorySlug);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory?.id || "");
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const categoryById = useMemo(
    () => new Map(categoryNodes.map((category) => [category.id, category])),
    [categoryNodes],
  );

  const childIdsByParentId = useMemo(() => {
    return categoryNodes.reduce((map, category) => {
      if (!category.parentId) return map;
      const ids = map.get(category.parentId) || [];
      ids.push(category.id);
      map.set(category.parentId, ids);
      return map;
    }, new Map<string, string[]>());
  }, [categoryNodes]);

  const categoriesWithProducts = useMemo(() => {
    return categories
      .filter((category) => {
        const relatedCategoryIds = new Set([
          category.id,
          ...category.subcategories.map((subcategory) => subcategory.id),
        ]);

        return initialProducts.some((product) => {
          const effectiveCategoryId = product.subcategoryId || product.categoryId;
          return Boolean(effectiveCategoryId && relatedCategoryIds.has(effectiveCategoryId));
        });
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [categories, initialProducts]);

  const selectedCategoryIds = useMemo(() => {
    if (!selectedCategoryId) return null;

    const category = categoryById.get(selectedCategoryId);
    if (!category) return null;

    return new Set([
      category.id,
      ...(category.parentId ? [] : childIdsByParentId.get(category.id) || []),
    ]);
  }, [categoryById, childIdsByParentId, selectedCategoryId]);

  const selectedProducts = useMemo(() => {
    if (!selectedCategoryIds) return initialProducts;

    return initialProducts.filter((product) => {
      const effectiveCategoryId = product.subcategoryId || product.categoryId;
      return Boolean(effectiveCategoryId && selectedCategoryIds.has(effectiveCategoryId));
    });
  }, [initialProducts, selectedCategoryIds]);

  const otherProducts = useMemo(() => {
    if (!selectedCategoryIds) return [];

    return initialProducts.filter((product) => {
      const effectiveCategoryId = product.subcategoryId || product.categoryId;
      return !effectiveCategoryId || !selectedCategoryIds.has(effectiveCategoryId);
    });
  }, [initialProducts, selectedCategoryIds]);

  const buildRows = (sourceProducts: Product[]) => {
    const grouped = sourceProducts.reduce((map, product) => {
      const categoryId = product.subcategoryId || product.categoryId;
      if (!categoryId || !categoryById.has(categoryId)) return map;

      const products = map.get(categoryId) || [];
      products.push(product);
      map.set(categoryId, products);
      return map;
    }, new Map<string, Product[]>());

    return categoryNodes
      .map<ProductRow | null>((category) => {
        const products = grouped.get(category.id) || [];
        return products.length ? { categoryId: category.id, products } : null;
      })
      .filter((row): row is ProductRow => Boolean(row));
  };

  const selectedRows = useMemo(() => buildRows(selectedProducts), [categoryById, categoryNodes, selectedProducts]);
  const otherRows = useMemo(() => buildRows(otherProducts), [categoryById, categoryNodes, otherProducts]);
  const visibleRows = selectedCategoryId ? selectedRows : selectedRows;

  const totalPages = Math.max(
    1,
    ...visibleRows.map((row) =>
      Math.ceil(row.products.length / PRODUCTS_PER_CATEGORY_PAGE),
    ),
  );

  const pagedRows = visibleRows
    .map((row) => ({
      categoryId: row.categoryId,
      products: row.products.slice(
        page * PRODUCTS_PER_CATEGORY_PAGE,
        (page + 1) * PRODUCTS_PER_CATEGORY_PAGE,
      ),
    }))
    .filter((row) => row.products.length > 0);

  const pagedOtherRows = otherRows
    .map((row) => ({
      categoryId: row.categoryId,
      products: row.products.slice(0, PRODUCTS_PER_CATEGORY_PAGE),
    }))
    .filter((row) => row.products.length > 0);

  useEffect(() => {
    setPage(0);
  }, [selectedCategoryId]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId((current) => (current === categoryId ? "" : categoryId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => setSelectedCategoryId("")}
          className={`relative z-10 flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !selectedCategoryId
              ? "bg-[#f6a45d] text-white"
              : "border border-[#d8a928]/30 bg-white text-[#0a0a0a] hover:bg-[#fcf5e8]"
          }`}
        >
          All
        </button>

        <div className="ml-2 flex-1 overflow-hidden">
          <div className="flex gap-2 animate-scroll">
            {[...categories, ...categories].map((category, index) => (
              <button
                key={`${category.id}-${index}`}
                onClick={() => selectCategory(category.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategoryId === category.id
                    ? "bg-[#f6a45d] text-white"
                    : "border border-[#d8a928]/30 bg-white text-[#0a0a0a] hover:bg-[#fcf5e8]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative grid gap-6">
        {filtersOpen ? (
          <aside className="fixed left-0 top-24 z-50 w-44 max-w-[74vw] rounded-r-xl border-y border-r border-[#d8a928]/20 bg-white/95 p-2.5 shadow-2xl backdrop-blur lg:left-[max(1rem,calc((100vw-80rem)/2+1.5rem))] lg:top-28 lg:rounded-xl lg:border">
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Filters
                </p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#fcf5e8] text-[#0a0a0a] hover:bg-[#ffedd5]"
                  aria-label="Hide filters"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategoryId("")}
                className={`mb-2 w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold transition ${
                  !selectedCategoryId
                    ? "bg-[#f6a45d] text-white"
                    : "bg-[#fcf5e8] text-[#0a0a0a] hover:bg-[#ffedd5]"
                }`}
              >
                All Products
              </button>

              <div className="space-y-1.5">
                {categoriesWithProducts.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className={`w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold leading-snug transition ${
                      selectedCategoryId === category.id
                        ? "bg-[#f6a45d] text-white"
                        : "text-[#0a0a0a] hover:bg-[#fcf5e8]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#d8a928]/30 bg-white px-3 py-2 text-xs font-semibold text-[#0a0a0a] shadow-sm hover:bg-[#fcf5e8]"
          >
            <Filter className="h-3.5 w-3.5" />
            Show Filters
          </button>
        )}

        {filtersOpen ? (
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="fixed inset-0 z-40 bg-black/10"
          />
        ) : null}

        <section className="min-w-0 space-y-6">
          {pagedRows.length > 0 ? (
            pagedRows.map((row) => (
              <div
                key={row.categoryId}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
              >
                {row.products.map((product) => (
                  <ProductCard key={product.handle} product={product} />
                ))}
                {Array.from({
                  length: PRODUCTS_PER_CATEGORY_PAGE - row.products.length,
                }).map((_, index) => (
                  <div key={`empty-${row.categoryId}-${index}`} className="hidden xl:block" />
                ))}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#d8a928]/20 bg-white p-12 text-center">
              <p className="text-lg text-[#5A5E55]">No products found.</p>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="rounded-lg border border-[#d8a928]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold ${
                    page === index
                      ? "bg-[#f6a45d] text-white"
                      : "border border-[#d8a928]/30 bg-white text-[#0a0a0a]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-[#d8a928]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}

          {selectedCategoryId && pagedOtherRows.length > 0 ? (
            <div className="space-y-6 border-t border-[#d8a928]/20 pt-8">
              <h2 className="font-serif text-xl font-bold text-[#0a0a0a]">Other Products</h2>
              {pagedOtherRows.map((row) => (
                <div
                  key={`other-${row.categoryId}`}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
                >
                  {row.products.map((product) => (
                    <ProductCard key={product.handle} product={product} />
                  ))}
                  {Array.from({
                    length: PRODUCTS_PER_CATEGORY_PAGE - row.products.length,
                  }).map((_, index) => (
                    <div key={`empty-other-${row.categoryId}-${index}`} className="hidden xl:block" />
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
