"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

import { Money, ProductProvider, useCart } from "@/lib/commerce";
import { viewContent, addToCart as trackAddToCart, addToWishlist as trackAddToWishlist } from "@/lib/pixel";

import { Button } from "@esmate/shadcn/components/ui/button";
import { Separator } from "@esmate/shadcn/components/ui/separator";
import { Badge } from "@esmate/shadcn/components/ui/badge";
import { Label } from "@esmate/shadcn/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@esmate/shadcn/components/ui/tabs";
import { Skeleton } from "@esmate/shadcn/components/ui/skeleton";

import {
  Minus,
  Plus,
  Copy,
  Facebook,
  Twitter,
  ShoppingCart,
  Zap,
  Share2,
  Heart,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Package,
  Check,
} from "@esmate/shadcn/pkgs/lucide-react";

import { toast } from "sonner";
import { titleize } from "@esmate/utils/string";

import { useVariantSelector } from "@/hooks/use-variant-selector";
import { StoreProductCard } from "@/components/features/products/store-product-card-wrapper";
import { getProductSingle } from "./service";
import { ProductReviews } from "@/components/features/products/product-reviews";
import { ProductDetailsSlider } from "@/components/features/products/product-details-slider";
import { ProductCertificatesSlider } from "@/components/features/products/product-certificates-slider";
import { ProductReviewsSlider } from "@/components/features/products/product-reviews-slider";
import { ProductGallerySection } from "./_components/ProductGallerySection";

interface Props {
  data: Awaited<ReturnType<typeof getProductSingle>>;
}

export function ProductSingle({ data }: Props) {
  const router = useRouter();
  const { linesAdd } = useCart();
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  const defaultVariantId = useMemo(() => {
    return data.variants?.nodes.find((v) => v.availableForSale)?.id || data.variants?.nodes[0]?.id;
  }, [data.variants?.nodes]);

  interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }

  const { variantId, options, selectOption } = useVariantSelector(data, defaultVariantId);

  const selectedVariant = useMemo(() => {
    return data.variants?.nodes.find((v: any) => v.id === variantId) || data.variants?.nodes[0] || null;
  }, [variantId, data.variants?.nodes]);

  const [currentImage, setCurrentImage] = useState(data.images.nodes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [url, setUrl] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  // Extract product handle from the URL for reviews
  const productHandle = useMemo(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      return path.split("/").pop() || data.handle;
    }
    return data.handle;
  }, [data.handle]);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);

    const price = parseFloat(
      data.variants?.nodes[0]?.price.amount || data.priceRange?.minVariantPrice?.amount || "0",
    );
    viewContent(data.title, data.id, price);

    // Fetch review stats for the product
    fetchReviewStats();
  }, [data.title, data.id, data.variants?.nodes, data.priceRange?.minVariantPrice?.amount, productHandle]);

  async function fetchReviewStats() {
    try {
      const res = await fetch(`/api/reviews?productHandle=${productHandle}&limit=1`);
      const data = await res.json();
      if (data.statistics) {
        setReviewStats(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch review stats:", error);
    }
  }

  const changeQty = (n: number) => setQuantity((q) => Math.max(1, q + n));

  const getSelectedVariationId = () => {
    if (data.variations && data.variations.length > 0 && Object.keys(selectedVariations).length > 0) {
      const matching = data.variations.find((v) =>
        Object.entries(selectedVariations).every(([name, value]) => {
          const variation = data.variations?.find((vv) => vv.name === name && vv.value === value);
          return variation !== undefined;
        })
      );
      if (matching) return matching.id;
    }
    return null;
  };

  const getSelectedPrice = () => {
    const variationId = getSelectedVariationId();
    if (variationId) {
      const variation = data.variations?.find((v) => v.id === variationId);
      if (variation) {
        const priceAmount = typeof variation.price === 'object' && variation.price !== null && 'amount' in variation.price 
          ? (variation.price as any).amount 
          : variation.price;
        return parseFloat(String(priceAmount));
      }
    }
    const targetVariantId = variantId || selectedVariant?.id || defaultVariantId;
    if (targetVariantId) {
      const variant = data.variants?.nodes.find((v: any) => v.id === targetVariantId);
      if (variant) return parseFloat(variant.price.amount);
    }
    return 0;
  };

  const getSelectedDisplayLabel = () => {
    if (data.variations && data.variations.length > 0 && Object.keys(selectedVariations).length > 0) {
      const labels = Object.entries(selectedVariations).map(([name, value]) => `${name}: ${value}`);
      return labels.join(", ");
    }
    const targetVariantId = variantId || selectedVariant?.id || defaultVariantId;
    if (targetVariantId) {
      const variant = data.variants?.nodes.find((v: any) => v.id === targetVariantId);
      if (variant && variant.selectedOptions.length > 0) {
        return variant.selectedOptions.map((o: any) => `${o.name}: ${o.value}`).join(", ");
      }
    }
    return "";
  };

  const addToCart = async () => {
    const variationId = getSelectedVariationId();
    const targetVariantId = variantId || selectedVariant?.id || defaultVariantId;
    
    const merchandiseId = variationId || targetVariantId;
    if (!merchandiseId) {
      toast.error("This product is not available right now");
      return;
    }
    try {
      await linesAdd([{ merchandiseId, quantity }]);
      const price = getSelectedPrice();
      const label = getSelectedDisplayLabel();
      toast.success("Added to cart", {
        description: `${quantity} × ${data.title}${label ? ` (${label})` : ""}`,
        icon: <ShoppingCart className="h-4 w-4" />,
      });

      trackAddToCart(data.title, merchandiseId, price);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const buyNow = async () => {
    const variationId = getSelectedVariationId();
    const targetVariantId = variantId || selectedVariant?.id || defaultVariantId;
    
    const merchandiseId = variationId || targetVariantId;
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard");
  };

  const toggleWishlist = () => {
    setWishlisted((w) => !w);
    toast.success(!wishlisted ? "Added to wishlist" : "Removed from wishlist");

    if (!wishlisted) {
      const targetVariantId = variantId || selectedVariant?.id || defaultVariantId;
      const price = selectedVariant
        ? parseFloat(selectedVariant.price.amount)
        : 0;
      trackAddToWishlist(data.title, targetVariantId || data.handle, price);
    }
  };

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(data.title);

  // Calculate the display price based on selected variations or selected variant
  const displayPrice = useMemo(() => {
    if (data.variations && data.variations.length > 0 && Object.keys(selectedVariations).length > 0) {
      // If variations are selected, use the variation price
      const selectedPrice = getSelectedPrice();
      if (selectedPrice > 0) {
        return {
          amount: selectedPrice.toFixed(2),
          currencyCode: selectedVariant?.price.currencyCode || 'PKR'
        };
      }
    }
    // Otherwise use the selected variant price
    return selectedVariant?.price || data.priceRange?.minVariantPrice || { amount: '0', currencyCode: 'PKR' };
  }, [selectedVariations, data.variations, selectedVariant, data.priceRange?.minVariantPrice]);

  const priceBlock = useMemo(() => {
    if (!displayPrice) return null;

    const price = parseFloat(displayPrice.amount);
    const compareAt = selectedVariant?.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : null;

    const hasDiscount = compareAt !== null && compareAt > price;
    const savedAmount = hasDiscount ? compareAt! - price : 0;
    const savedPct = hasDiscount ? Math.round((savedAmount / compareAt!) * 100) : 0;

    return { hasDiscount, savedAmount, savedPct, displayPrice, compareAt };
  }, [displayPrice, selectedVariant?.compareAtPrice]);

  return (
    <ProductProvider data={data}>
      <section className="w-full bg-[#fcf5e8] overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#5A5E55] mb-6">
            <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <Link href="/products" className="hover:text-[#0a0a0a] transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <span className="max-w-50 truncate font-medium text-[#0a0a0a]">{data.title}</span>
          </nav>

          {/* Main Grid */}
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
            
            <ProductGallerySection
              title={data.title}
              images={data.images.nodes}
              currentImage={currentImage}
              onSelectImage={setCurrentImage}
              onToggleWishlist={toggleWishlist}
              wishlistActive={wishlisted}
              discountBadge={priceBlock?.hasDiscount ? { hasDiscount: true, savedPct: priceBlock.savedPct } : null}
            />

            {/* RIGHT COLUMN - Product Info */}
            <div className="space-y-4">
{/* Header Card */}
               <div className="rounded-xl bg-white border border-[#d8a928]/20 p-4">
                 <div className="flex items-start justify-between gap-3 mb-3">
                   <div className="flex-1 min-w-0">
                     <h1 className="mb-2 text-xl font-bold tracking-tight text-[#0a0a0a] wrap-break-word">
                       {data.title}
                     </h1>
<div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const fillPercent = reviewStats && reviewStats.totalReviews > 0
                              ? Math.max(0, Math.min(100, (reviewStats.averageRating - star + 1) * 100))
                              : 0;
                            return (
                              <div key={star} className="relative">
                                <Star className="h-3 w-3 text-gray-300" />
                                {fillPercent > 0 && (
                                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                                    <Star className="h-3 w-3 fill-[#d8a928] text-[#d8a928]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-[#5A5E55]">
                          {reviewStats?.totalReviews ? `(${reviewStats.averageRating.toFixed(1)} • ${reviewStats.totalReviews} reviews)` : "No reviews yet"}
                        </span>
                      </div>
                   </div>
                   <Badge variant="secondary" className="shrink-0 text-xs bg-[#fcf5e8] text-[#f6a45d] border border-[#d8a928]/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#f6a45d] mr-1 animate-pulse" />
                     In Stock
                   </Badge>
                 </div>

                {(selectedVariant || displayPrice) && (
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      {priceBlock?.hasDiscount && priceBlock.compareAt && (
                        <div className="text-sm text-[#0a0a0a] line-through opacity-50">
                          <span className="text-sm text-[#0a0a0a] line-through opacity-50">
                            {priceBlock.compareAt.toFixed(2)} PKR
                          </span>
                        </div>
                      )}
                      <div className="text-2xl font-bold text-[#f6a45d]">
                        {parseFloat(displayPrice.amount).toFixed(2)} PKR
                      </div>
                      {priceBlock?.hasDiscount && (
                        <Badge className="text-xs bg-[#f6a45d] text-[#fcf5e8] px-2">
                          Save ${priceBlock.savedAmount.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    {data.variations && data.variations.length > 0 && Object.keys(selectedVariations).length > 0 && (
                      <p className="text-[10px] text-[#f6a45d] mt-1 font-medium">
                        Price updated based on your selection
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Options Card */}
              <div className="rounded-xl bg-white border border-[#d8a928]/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[#0a0a0a]">Choose Options</h2>
                  <span className="text-[10px] text-[#5A5E55]">Optional</span>
                </div>
                <Separator className="mb-3 bg-[#d8a928]/20" />

                <div className="space-y-4">
                  {/* Variant Options */}
                  {options.map((opt) => (
                    <div key={opt.name} className="space-y-2">
                      <Label className="text-xs font-semibold text-[#0a0a0a]">{opt.name}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.values.map((v) => (
                          <button
                            key={v.value}
                            disabled={v.disabled}
                            onClick={() => selectOption(opt.name, v.value)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-all
                              ${v.selected
                                ? "bg-[#f6a45d] text-white shadow-sm"
                                : "border border-[#d8a928]/30 text-[#0a0a0a] hover:border-[#f6a45d] hover:bg-[#f6a45d]/5"
                              }
                              ${v.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {v.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Variations Section */}
                  {data.variations && data.variations.length > 0 && (
                    <div className="border-t border-[#d8a928]/20 pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-bold text-[#0a0a0a]">Available Options</Label>
                        {Object.keys(selectedVariations).length > 0 && (
                          <span className="text-xs text-[#f6a45d] font-medium">
                            {Object.keys(selectedVariations).length} option(s) selected
                          </span>
                        )}
                      </div>
                      
                      {/* Group variations by name */}
                      {(() => {
                        const groupedVariations = data.variations.reduce((acc, variation) => {
                          if (!acc[variation.name]) {
                            acc[variation.name] = [];
                          }
                          acc[variation.name].push(variation);
                          return acc;
                        }, {} as Record<string, typeof data.variations>);

                        return Object.entries(groupedVariations).map(([groupName, variations]) => (
                          <div key={groupName} className="mb-4 last:mb-0">
                            <Label className="text-xs font-semibold text-[#0a0a0a] block mb-2 capitalize">
                              {groupName}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {variations.map((variation) => {
                                const isSelected = selectedVariations[groupName] === variation.value;
                                return (
                                  <button
                                    key={variation.id}
                                    onClick={() =>
                                      setSelectedVariations((current) => {
                                        const next = { ...current };
                                        if (next[groupName] === variation.value) {
                                          delete next[groupName];
                                        } else {
                                          next[groupName] = variation.value;
                                        }
                                        return next;
                                      })
                                    }
                                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium
                                      ${isSelected
                                        ? "bg-[#f6a45d] text-white shadow-md"
                                        : "bg-[#fcf5e8] border border-[#d8a928]/30 text-[#0a0a0a] hover:border-[#f6a45d] hover:bg-[#f6a45d]/5"
                                      }`}
                                  >
                                    <span>{variation.value}</span>
                                    {(() => {
                                      const varPrice = typeof variation.price === 'object' && variation.price !== null && 'amount' in variation.price 
                                        ? parseFloat(String((variation.price as any).amount))
                                        : parseFloat(String(variation.price));
                                      const selectedPrice = selectedVariant?.price?.amount 
                                        ? parseFloat(String(selectedVariant.price.amount))
                                        : 0;
                                      if (varPrice !== selectedPrice) {
                                        return (
                                          <span className={`ml-1.5 text-xs ${isSelected ? 'text-white/90' : 'text-[#f6a45d]'}`}>
                                            ({varPrice.toFixed(2)} PKR)
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                      
                      {Object.keys(selectedVariations).length === 0 && (
                        <p className="text-xs text-[#5A5E55] text-center mt-3 p-3 bg-[#fcf5e8] rounded-lg border border-[#d8a928]/20">
                          Please select your preferred options above
                        </p>
                      )}
                      
                      {/* Selected variations summary */}
                      {Object.keys(selectedVariations).length > 0 && (
                        <div className="mt-3 p-3 bg-[#f6a45d]/5 rounded-lg border border-[#f6a45d]/20">
                          <div className="text-xs font-semibold text-[#0a0a0a] mb-2">Selected Options:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedVariations).map(([name, value]) => (
                              <span key={name} className="text-xs bg-[#f6a45d]/10 text-[#f6a45d] px-2 py-1 rounded">
                                {name}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#0a0a0a]">Quantity</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => changeQty(-1)}
                        className="h-8 w-8 rounded-lg border-[#d8a928]/30"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="flex items-center justify-center w-12 h-8 rounded-lg bg-[#fcf5e8] border border-[#d8a928]/30">
                        <span className="text-sm font-semibold text-[#0a0a0a]">{quantity}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => changeQty(1)}
                        className="h-8 w-8 rounded-lg border-[#d8a928]/30"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="default"
                        onClick={addToCart}
                        className="h-9 text-xs rounded-lg bg-[#f6a45d] hover:bg-[#d8861f] text-white"
                      >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                      <Button
                        size="default"
                        onClick={buyNow}
                        disabled={buyLoading}
                        className="h-9 text-xs rounded-lg bg-[#1a1308] hover:bg-[#2A2B28] text-white"
                      >
                        <Zap className="mr-1.5 h-3.5 w-3.5" />
                        {buyLoading ? "..." : "Buy Now"}
                      </Button>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                          `Hi, I want to order ${data.title} (Qty: ${quantity})`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 h-9 text-xs rounded-lg bg-[#f6a45d] hover:bg-[#d8861f] text-white"
                      >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

{/* Description & Specs Tabs */}
               <div className="rounded-xl bg-white border border-[#d8a928]/20 overflow-hidden">
                 <Tabs defaultValue="description">
                   <TabsList className="grid w-full grid-cols-2 bg-[#fcf5e8] border-b border-[#d8a928]/20 h-10">
                     <TabsTrigger value="description" className="text-xs data-[state=active]:bg-white">Description</TabsTrigger>
                     <TabsTrigger value="specs" className="text-xs data-[state=active]:bg-white">Specs</TabsTrigger>
                   </TabsList>

                   <TabsContent value="description" className="p-4">
                     <div
                       className="prose prose-sm max-w-none text-[#5A5E55] text-xs"
                       dangerouslySetInnerHTML={{ __html: data.descriptionHtml || "" }}
                     />
                   </TabsContent>

                   <TabsContent value="specs" className="p-4">
                     <div className="space-y-2">
                       {data.metafields?.map((field: any) => (
                         <div key={field.key} className="flex justify-between gap-3 py-2 text-xs border-b border-[#d8a928]/10">
                           <span className="font-semibold text-[#0a0a0a]">{field.key}</span>
                           <span className="text-[#5A5E55] text-right">{field.value}</span>
                         </div>
                       ))}
                     </div>
                   </TabsContent>
                 </Tabs>
               </div>

           
              </div>
            </div>
          </div>


   {/* Product Details Slider */}
               {data.details && Array.isArray(data.details) && data.details.length > 0 && (
                 <div className="rounded-xl bg-white border border-[#d8a928]/20 overflow-hidden p-4">
                   <ProductDetailsSlider details={data.details} />
                 </div>
               )}

               {/* Certificates Slideshow */}
               {data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0 && (
                 <div className="rounded-xl bg-white border border-[#d8a928]/20 overflow-hidden p-4">
                   <ProductCertificatesSlider certificates={data.certificates} />
                 </div>
               )}


               {/* Full Reviews Section with Form */}
               <div className="rounded-xl bg-white border border-[#d8a928]/20 overflow-hidden">
                 <div className="border-b border-[#d8a928]/20 bg-[#fcf5e8]/50 px-4 py-3">
                   <h2 className="text-lg font-bold text-[#0a0a0a]">Write a Review</h2>
                   <p className="text-xs text-[#5A5E55] mt-1">Share your detailed experience with this product</p>
                 </div>
                 <div className="p-4">
                   <ProductReviews productHandle={productHandle} />
                 </div>
               </div>

              {/* Share */}
              <div className="rounded-xl bg-white border border-[#d8a928]/20 p-3">
                


          {/* RECOMMENDATIONS SECTION - KEPT INTACT */}
          {data.recommendations?.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a0a0a]">You may also like</h2>
                  <p className="text-sm text-[#5A5E55] mt-1">Discover more products you might love</p>
                </div>
                <Button variant="outline" className="gap-1.5 h-8 text-xs border-[#d8a928]/30">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.recommendations.map((p: any) => (
                  <StoreProductCard
                    key={p.handle}
                    handle={p.handle}
                    title={titleize(p.title)}
                    featuredImageUrl={p.featuredImage?.url || "/logo/mmlaptop.png"}
                    price={p.priceRange.minVariantPrice}
                    tag={p.tags?.[0]}
                    productId={p.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </ProductProvider>
  );
}
