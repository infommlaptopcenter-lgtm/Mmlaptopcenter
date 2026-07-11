"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ShoppingCart } from "@esmate/shadcn/pkgs/lucide-react";
import { toast } from "sonner";

import { ProductProvider, useCart } from "@/lib/commerce";
import { addToCart as trackAddToCart, addToWishlist as trackAddToWishlist, viewContent } from "@/lib/pixel";
import { useVariantSelector } from "@/hooks/use-variant-selector";

import { getProductSingle } from "./service";
import { ProductGallerySection } from "./_components/ProductGallerySection";
import { ProductInfoPanel } from "./_components/ProductInfoPanel";
import { ProductVariantsSection } from "./_components/ProductVariantsSection";
import { ExtraProductDetails } from "./_components/ExtraProductDetails";
import {
  ProductDescriptionSection,
  ProductReviewsSection,
  RelatedProductsSection,
} from "./_components/ProductContentSections";
import {
  buildWhatsAppOrderMessage,
  formatMoney,
  getFallbackReviewStats,
  type PriceBlock,
  type ReviewStats,
} from "./_components/product-page-utils";

interface Props {
  data: Awaited<ReturnType<typeof getProductSingle>>;
}

export function ProductSingle({ data }: Props) {
  const router = useRouter();
  const { linesAdd } = useCart();
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [currentImage, setCurrentImage] = useState(data.images.nodes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [url, setUrl] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const defaultVariantId = useMemo(() => {
    return data.variants?.nodes.find((variant) => variant.availableForSale)?.id || data.variants?.nodes[0]?.id;
  }, [data.variants?.nodes]);

  const { variantId, options, selectOption, selectVariant } = useVariantSelector(data, defaultVariantId);

  const selectedVariant = useMemo(() => {
    return data.variants?.nodes.find((variant) => variant.id === variantId) || data.variants?.nodes[0] || null;
  }, [data.variants?.nodes, variantId]);
  const selectedImages = selectedVariant?.images?.length ? selectedVariant.images : data.images.nodes;
  const selectedTitle = selectedVariant?.name || data.title;

  const productHandle = data.handle;
  const fallbackReviewStats = useMemo(() => getFallbackReviewStats(data.id || data.handle || data.title), [
    data.handle,
    data.id,
    data.title,
  ]);
  const visibleReviewStats =
    reviewStats && reviewStats.totalReviews > 0 ? reviewStats : fallbackReviewStats;

  const inventory = useMemo(() => {
    if (typeof selectedVariant?.stock === "number") return selectedVariant.stock;
    const value = data.metafields?.find((field) => field.key === "inventory")?.value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }, [data.metafields, selectedVariant?.stock]);

  useEffect(() => {
    setCurrentImage(selectedImages[0] || null);
  }, [selectedImages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }

    const price = parseFloat(
      data.variants?.nodes[0]?.price.amount || data.priceRange?.minVariantPrice?.amount || "0",
    );
    viewContent(data.title, data.id, price);
  }, [data.id, data.priceRange?.minVariantPrice?.amount, data.title, data.variants?.nodes]);

  useEffect(() => {
    async function fetchReviewStats() {
      try {
        const res = await fetch(`/api/reviews?productHandle=${productHandle}&limit=1`);
        const response = await res.json();
        if (response.statistics) {
          setReviewStats(response.statistics);
        }
      } catch (error) {
        console.error("Failed to fetch review stats:", error);
      }
    }

    void fetchReviewStats();
  }, [productHandle]);

  const getSelectedPrice = () => {
    const targetVariant = data.variants?.nodes.find((variant) => variant.id === (variantId || defaultVariantId));
    return parseFloat(targetVariant?.price.amount || data.priceRange?.minVariantPrice?.amount || "0");
  };

  const getSelectedDisplayLabel = () => {
    const targetVariant = data.variants?.nodes.find((variant) => variant.id === (variantId || defaultVariantId));
    const selectedOptions = targetVariant?.selectedOptions as Array<{ name: string; value: string }> | undefined;
    return selectedOptions?.map((option) => `${option.name}: ${option.value}`).join(", ") || "";
  };

  const displayPrice = useMemo(() => {
    const selectedPrice = getSelectedPrice();

    return {
      amount: selectedPrice.toFixed(2),
      currencyCode: selectedVariant?.price.currencyCode || data.priceRange?.minVariantPrice?.currencyCode || "PKR",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.priceRange?.minVariantPrice?.currencyCode, selectedVariant, variantId]);

  const priceBlock: PriceBlock | null = useMemo(() => {
    if (!displayPrice) return null;

    const price = parseFloat(displayPrice.amount);
    const compareAt = selectedVariant?.compareAtPrice
      ? parseFloat(selectedVariant.compareAtPrice.amount)
      : null;
    const hasDiscount = compareAt !== null && compareAt > price;
    const savedAmount = hasDiscount ? compareAt - price : 0;
    const savedPct = hasDiscount ? Math.round((savedAmount / compareAt) * 100) : 0;

    return { hasDiscount, savedAmount, savedPct, displayPrice, compareAt };
  }, [displayPrice, selectedVariant?.compareAtPrice]);

  const selectedLabel = getSelectedDisplayLabel();
  const selectedPriceLabel = formatMoney(displayPrice.amount, displayPrice.currencyCode);
  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsAppHref = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
    buildWhatsAppOrderMessage({
      title: selectedTitle,
      price: selectedPriceLabel,
      quantity,
      selectedOptions: selectedLabel,
      url,
    }),
  )}`;

  const changeQuantity = (amount: number) => {
    setQuantity((current) => Math.max(1, current + amount));
  };

  const addToCart = async () => {
    const merchandiseId = variantId || selectedVariant?.id || defaultVariantId;

    if (!merchandiseId) {
      toast.error("This product is not available right now");
      return;
    }

    try {
      await linesAdd([{ merchandiseId, quantity }]);
      toast.success("Added to cart", {
        description: `${quantity} x ${selectedTitle}${selectedLabel ? ` (${selectedLabel})` : ""}`,
        icon: <ShoppingCart className="h-4 w-4" />,
      });
      trackAddToCart(selectedTitle, merchandiseId, getSelectedPrice());
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const buyNow = async () => {
    const merchandiseId = variantId || selectedVariant?.id || defaultVariantId;

    if (!merchandiseId) {
      toast.error("This product is not available right now");
      return;
    }

    setBuyLoading(true);
    try {
      await linesAdd([{ merchandiseId, quantity }]);
      router.push("/checkout");
    } catch {
      toast.error("Checkout failed");
    } finally {
      setBuyLoading(false);
    }
  };

  const toggleWishlist = () => {
    setWishlisted((current) => !current);
    toast.success(!wishlisted ? "Added to wishlist" : "Removed from wishlist");

    if (!wishlisted) {
      trackAddToWishlist(data.title, variantId || selectedVariant?.id || data.handle, getSelectedPrice());
    }
  };

  return (
    <ProductProvider data={data}>
      <section className="w-full overflow-x-hidden bg-[#fcf5e8]">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#5A5E55]">
            <Link href="/" className="transition-colors hover:text-[#0a0a0a]">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <Link href="/products" className="transition-colors hover:text-[#0a0a0a]">Products</Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <span className="max-w-[16rem] truncate font-medium text-[#0a0a0a]">{data.title}</span>
          </nav>

          <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ProductGallerySection
              title={selectedTitle}
              images={selectedImages}
              currentImage={currentImage}
              onSelectImage={setCurrentImage}
              onToggleWishlist={toggleWishlist}
              wishlistActive={wishlisted}
              discountBadge={priceBlock?.hasDiscount ? { hasDiscount: true, savedPct: priceBlock.savedPct } : null}
            />

            <ProductInfoPanel
              title={selectedTitle}
              priceBlock={priceBlock}
              reviewStats={visibleReviewStats}
              inventory={inventory}
              sku={selectedVariant?.sku}
              specifications={selectedVariant?.specifications}
              availableForSale={Boolean(selectedVariant?.availableForSale)}
              options={options}
              selectOption={selectOption}
              quantity={quantity}
              changeQuantity={changeQuantity}
              selectedLabel={selectedLabel}
              buyLoading={buyLoading}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              whatsAppHref={whatsAppHref}
            />
          </div>

          <ProductVariantsSection
            variants={data.variants.nodes}
            selectedId={selectedVariant?.id}
            fallbackImage={data.featuredImage?.url || undefined}
            onSelect={selectVariant}
          />

          <ProductDescriptionSection
            description={data.description}
            descriptionHtml={data.descriptionHtml}
          />

          <ExtraProductDetails details={data.details || []} />

          <ProductReviewsSection productHandle={productHandle} />

          <RelatedProductsSection products={data.recommendations || []} />
        </div>
      </section>
    </ProductProvider>
  );
}
