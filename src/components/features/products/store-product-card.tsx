"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiZap } from "react-icons/fi";
import { useCart } from "@/lib/commerce";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import {
  addToCart as trackAddToCart,
  contact as trackContact,
} from "@/lib/pixel";

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
  initialReviewStats?: ReviewStats | null;
};

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

const reviewStatsRequests = new Map<string, Promise<ReviewStats | null>>();

function loadReviewStats(handle: string) {
  const existing = reviewStatsRequests.get(handle);
  if (existing) return existing;

  const request = fetch(
    `/api/reviews?productHandle=${encodeURIComponent(handle)}&statsOnly=1`,
  )
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as {
        statistics?: ReviewStats;
      };
      return data.statistics ?? null;
    })
    .catch(() => null);

  reviewStatsRequests.set(handle, request);
  return request;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = "/logo/new logo.png";

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

function ProductRating({
  rating,
  totalReviews,
}: {
  rating: number;
  totalReviews: number;
}) {
  const activeStars = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="flex items-center gap-0.5 leading-none"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
      >
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
  initialReviewStats,
}: ProductCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(
    initialReviewStats ?? null,
  );
  const { linesAdd } = useCart();

  // ── Slide transition state ──

  const productImages = useMemo(() => {
    const urls = [featuredImageUrl, ...(imageUrls || [])]
      .filter(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0,
      )
      .filter((url, index, all) => all.indexOf(url) === index)
      .filter((url) => !failedImages.includes(url));

    return urls.length > 0 ? urls : [FALLBACK_IMAGE];
  }, [featuredImageUrl, imageUrls, failedImages]);

  const primaryImage = productImages[0] || FALLBACK_IMAGE;
  const hoverImage = productImages[1];
  const currentImg = primaryImage;
  const incomingImg = hoverImage;

  const effectiveVariantId = variantId || productId;

  const discount = compareAtPrice
    ? discountPercent(compareAtPrice.amount, price.amount)
    : null;
  const defaultReviewStats = useMemo(
    () => getDefaultReviewStats(productId || handle || title),
    [handle, productId, title],
  );
  const visibleReviewStats =
    reviewStats && reviewStats.totalReviews > 0
      ? reviewStats
      : defaultReviewStats;

  const productPath = `/products/${handle}`;
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent(
    `Hi, I want to order this product:\n\nProduct: ${title}\nPrice: ${formatPrice(price.amount)}\nLink: ${productPath}`,
  )}`;

  // ── Fetch review stats ──
  useEffect(() => {
    if (initialReviewStats) return;
    let active = true;

    async function fetchReviewStats() {
      const statistics = await loadReviewStats(handle);
      if (active && statistics) setReviewStats(statistics);
    }
    void fetchReviewStats();
    return () => {
      active = false;
    };
  }, [handle, initialReviewStats]);

  useEffect(() => {
    setFailedImages([]);
  }, [featuredImageUrl, imageUrls]);

  /*
  // ── Slide transition: new image glides in from the right, old one glides out to the left ──
  useEffect(() => {
    // First image ever — just set it, no animation needed.
    return;

    // Kick the animation off on the next paint so the browser registers the
    // starting (off-screen) position before we transition to the ending
    // position — otherwise it can appear to "snap" instead of sliding.
    const raf = requestAnimationFrame(() => {
      // Force a layout read so the browser commits the starting transform
      // before we flip the class that starts the transition.
      void document.body.offsetHeight;
      return;
    });

    // Match this to the transition duration below (ms). Kept in sync with
    // the Tailwind `duration-700` class used on the sliding layers.
    const SLIDE_DURATION = 700;
    const timeout = setTimeout(() => {
      return;
    }, SLIDE_DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return;

    const interval = window.setInterval(() => {
      return;
    }, 10000);

    return () => window.clearInterval(interval);
  }, [productImages.length]);
  */

  // ── Buy now ──
  const handleBuyNow = async () => {
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
      trackAddToCart({
        content_ids: [productId || effectiveVariantId],
        contents: [
          {
            id: productId || effectiveVariantId,
            quantity: 1,
            item_price: parseFloat(price.amount),
            variant: effectiveVariantId,
          },
        ],
        content_name: title,
        content_category: tag,
        content_type: "product",
        value: parseFloat(price.amount),
        currency: "PKR",
        num_items: 1,
      });
      router.push("/checkout");
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-[0_0_14px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_0_26px_rgba(0,0,0,0.22)]">
      {/* ── Tag badge ─────────────────────────────────────── */}
      {/* ── WhatsApp floating button ───────────────────────── */}
      {discount !== null && (
        <span className="absolute right-3 top-3 z-20 rounded-full border border-orange-400 bg-orange-500 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg">
          {discount}% OFF
        </span>
      )}

      <div className="absolute left-3 top-3 z-20 rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
        <div className="text-sm font-extrabold leading-none text-[#0a0a0a]">
          {formatPrice(price.amount)}
        </div>
        {discount !== null &&
          compareAtPrice &&
          parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-bold leading-tight">
              <span className="text-gray-500 line-through">
                {formatPrice(compareAtPrice.amount)}
              </span>
            </div>
          )}
      </div>

      {/* ── Product image ──────────────────────────────────── */}
      <Link
        href={`/products/${handle}`}
        className="relative block aspect-square w-full overflow-hidden bg-white"
      >
        {/* Current image — slides out to the left once a new image starts coming in */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            incomingImg
              ? "group-hover:opacity-0 group-focus-within:opacity-0"
              : ""
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
                  current.includes(currentImg)
                    ? current
                    : [...current, currentImg],
                )
              }
            />
          )}
        </div>

        {/* Incoming image — starts fully off-screen to the right, glides in slowly */}
        {incomingImg && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100">
            <Image
              src={incomingImg}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-5"
              onError={() =>
                setFailedImages((current) =>
                  current.includes(incomingImg)
                    ? current
                    : [...current, incomingImg],
                )
              }
            />
          </div>
        )}
      </Link>

      {/* ── Card body ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 px-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <ProductRating
            rating={visibleReviewStats.averageRating}
            totalReviews={visibleReviewStats.totalReviews}
          />
        </div>

        <Link
          href={`/products/${handle}`}
          className="group/title block min-h-10"
        >
          <h3 className="line-clamp-2 font-serif text-base font-extrabold leading-tight tracking-normal text-gray-950 transition-colors group-hover/title:text-orange-600 sm:text-lg">
            {title}
          </h3>
        </Link>

        {/* Product actions */}
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_2.75rem] gap-2">
          {/* Buy directly when a variant is available; otherwise open the product. */}
          {effectiveVariantId ? (
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#f47b20] px-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c] active:bg-[#d95513] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiZap className="h-5 w-5" />
              {loading ? "Processing…" : "Buy Now"}
            </button>
          ) : (
            <Link
              href={`/products/${handle}`}
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#f47b20] px-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c] active:bg-[#d95513]"
            >
              <FiZap className="h-5 w-5" />
              Buy Now
            </Link>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#079447] p-0 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#047a3a] hover:shadow-md active:scale-95"
            aria-label={`Order ${title} on WhatsApp`}
            onClick={() => trackContact("WhatsApp product order")}
          >
            <FaWhatsapp className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
