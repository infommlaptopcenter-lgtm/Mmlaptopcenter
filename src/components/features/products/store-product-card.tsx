"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/lib/commerce";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { addToCart as trackAddToCart } from "@/lib/pixel";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductCardProps = {
  handle: string;
  title: string;
  featuredImageUrl: string;
  imageUrls?: string[];
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  tag?: string;
  variantId?: string;
  productId?: string;
};

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = "/logo/mmlaptop.png";
const DEFAULT_RATING = 4.7;

function discountPercent(compare: string, current: string): number | null {
  const c = parseFloat(compare);
  const p = parseFloat(current);
  if (!c || !p || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

function formatPrice(amount: string) {
  const n = parseFloat(amount);
  return `Rs.${n.toLocaleString("en-PK")}`;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm leading-none">★</span>
      <span className="text-xs font-semibold text-[#0a0a0a]">
        {rating.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function getDefaultReviewStats(seedText: string): ReviewStats {
  let seed = 0;

  for (let index = 0; index < seedText.length; index += 1) {
    seed = (seed * 31 + seedText.charCodeAt(index)) % 10000;
  }

  return {
    averageRating: 4.4 + (seed % 6) / 10,
    totalReviews: 18 + (seed % 84),
  };
}

function ProductRating({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  const activeStars = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5 leading-none" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-sm ${index < activeStars ? "text-yellow-400" : "text-gray-300"}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </span>
      <span className="text-xs font-semibold text-[#0a0a0a]">
        {rating.toFixed(1)}
      </span>
      <span className="text-[11px] font-medium text-gray-400">
        ({totalReviews})
      </span>
    </div>
  );
}

export function StoreProductCard({
  handle,
  title,
  featuredImageUrl,
  imageUrls,
  price,
  compareAtPrice,
  tag,
  variantId,
  productId,
}: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const { linesAdd } = useCart();

  // ── Slide transition state ──
  const [currentImg, setCurrentImg] = useState<string | null>(null);
  const [incomingImg, setIncomingImg] = useState<string | null>(null);
  const [slideIn, setSlideIn] = useState(false);

  const productImages = useMemo(() => {
    const urls = [featuredImageUrl, ...(imageUrls || [])]
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      .filter((url, index, all) => all.indexOf(url) === index)
      .filter((url) => !failedImages.includes(url));

    return urls.length > 0 ? urls : [FALLBACK_IMAGE];
  }, [featuredImageUrl, imageUrls, failedImages]);

  const displayImageIndex = activeImageIndex % productImages.length;
  const displayImage = productImages[displayImageIndex] || FALLBACK_IMAGE;

  const effectiveVariantId = variantId || productId;

  const discount = compareAtPrice
    ? discountPercent(compareAtPrice.amount, price.amount)
    : null;
  const defaultReviewStats = useMemo(
    () => getDefaultReviewStats(productId || handle || title),
    [handle, productId, title]
  );
  const visibleReviewStats =
    reviewStats && reviewStats.totalReviews > 0 ? reviewStats : defaultReviewStats;

  const productPath = `/products/${handle}`;
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent(
    `Hi, I want to order this product:\n\nProduct: ${title}\nPrice: ${formatPrice(price.amount)}\nLink: ${productPath}`
  )}`;

  // ── Fetch review stats ──
  useEffect(() => {
    async function fetchReviewStats() {
      try {
        const res = await fetch(`/api/reviews?productHandle=${handle}&limit=1`);
        const data = await res.json();
        if (data.statistics) setReviewStats(data.statistics);
      } catch {
        // silently fail
      }
    }
    fetchReviewStats();
  }, [handle]);

  useEffect(() => {
    setActiveImageIndex(0);
    setFailedImages([]);
  }, [featuredImageUrl, imageUrls]);

  // ── Slide transition: new image glides in from the right, old one glides out to the left ──
  useEffect(() => {
    // First image ever — just set it, no animation needed.
    if (currentImg === null) {
      setCurrentImg(displayImage);
      return;
    }
    if (displayImage === currentImg || displayImage === incomingImg) return;

    setIncomingImg(displayImage);
    setSlideIn(false);

    // Kick the animation off on the next paint so the browser registers the
    // starting (off-screen) position before we transition to the ending
    // position — otherwise it can appear to "snap" instead of sliding.
    const raf = requestAnimationFrame(() => {
      // Force a layout read so the browser commits the starting transform
      // before we flip the class that starts the transition.
      void document.body.offsetHeight;
      setSlideIn(true);
    });

    // Match this to the transition duration below (ms). Kept in sync with
    // the Tailwind `duration-700` class used on the sliding layers.
    const SLIDE_DURATION = 700;
    const timeout = setTimeout(() => {
      setCurrentImg(displayImage);
      setIncomingImg(null);
      setSlideIn(false);
    }, SLIDE_DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayImage]);

  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % productImages.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [productImages.length]);

  // ── Add to cart ──
  const handleAddToCart = async () => {
    if (!effectiveVariantId) return;
    setLoading(true);
    try {
      await linesAdd([
        {
          merchandiseId: effectiveVariantId,
          quantity: 1,
          title,
          price,
          imageUrl: featuredImageUrl,
        },
      ]);
      toast.success("Added to cart", { description: title });
      trackAddToCart(title, effectiveVariantId, parseFloat(price.amount));
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-[0_0_14px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_0_26px_rgba(0,0,0,0.22)]"
    >

      {/* ── Tag badge ─────────────────────────────────────── */}
      {/* ── WhatsApp floating button ───────────────────────── */}
      {discount !== null && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-[#8b1a1a] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg">
          {discount}% OFF
        </span>
      )}

      <div className="absolute left-3 top-3 z-20 rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
        <div className="text-sm font-extrabold leading-none text-[#0a0a0a]">
          {formatPrice(price.amount)}
        </div>
        {discount !== null && compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-bold leading-tight">
            <span className="text-gray-500 line-through">
              {formatPrice(compareAtPrice.amount)}
            </span>
          </div>
        )}
      </div>

      <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur">
        <ProductRating
          rating={visibleReviewStats.averageRating}
          totalReviews={visibleReviewStats.totalReviews}
        />
      </div>

      {/* ── Product image ──────────────────────────────────── */}
      <Link
        href={`/products/${handle}`}
        className="block relative aspect-square w-full overflow-hidden bg-white"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
        onFocus={() => setIsImageHovered(true)}
        onBlur={() => setIsImageHovered(false)}
      >
        {/* Current image — slides out to the left once a new image starts coming in */}
        <div
          className={`absolute inset-0 transition-transform duration-700 ease-in-out will-change-transform group-hover:scale-110 ${
            incomingImg && slideIn ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {currentImg && (
            <Image
              src={currentImg}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-5"
              onError={() =>
                setFailedImages((current) =>
                  current.includes(currentImg) ? current : [...current, currentImg]
                )
              }
            />
          )}
        </div>

        {/* Incoming image — starts fully off-screen to the right, glides in slowly */}
        {incomingImg && (
          <div
            className={`absolute inset-0 transition-transform duration-700 ease-in-out will-change-transform group-hover:scale-110 ${
              slideIn ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <Image
              src={incomingImg}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-5"
              onError={() =>
                setFailedImages((current) =>
                  current.includes(incomingImg) ? current : [...current, incomingImg]
                )
              }
            />
          </div>
        )}
      </Link>

      {/* ── Card body ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 px-4 pb-4 pt-2">
        <Link href={`/products/${handle}`} className="group/title block min-h-10">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-[#0a0a0a] transition-colors group-hover/title:text-[#8b1a1a] sm:text-base">
            {title}
          </h3>
        </Link>

        {/* Prices + Buy Now button */}
        <div className="mt-2 grid grid-cols-2 gap-2">

          {/* Buy Now — add to cart if variantId exists, else link to PDP */}
          {effectiveVariantId ? (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="rounded-full bg-[#8b1a1a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#a52020] active:scale-95 disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "Adding…" : "Buy Now"}
            </button>
          ) : (
            <Link
              href={`/products/${handle}`}
              className="rounded-full bg-[#8b1a1a] px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-[#a52020] active:scale-95 whitespace-nowrap"
            >
              Buy Now
            </Link>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25d366] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1fb855] active:scale-95 whitespace-nowrap"
            aria-label={`Order ${title} on WhatsApp`}
          >
            <FaWhatsapp className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
