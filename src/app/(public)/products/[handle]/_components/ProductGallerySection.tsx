import Image from "next/image";
import { Badge } from "@esmate/shadcn/components/ui/badge";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Skeleton } from "@esmate/shadcn/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
} from "@esmate/shadcn/pkgs/lucide-react";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

type ProductGallerySectionProps = {
  title: string;
  images: GalleryImage[];
  currentImage: GalleryImage | null;
  onSelectImage: (image: GalleryImage) => void;
  onToggleWishlist: () => void;
  wishlistActive: boolean;
  discountBadge?: { hasDiscount: boolean; savedPct: number } | null;
};

export function ProductGallerySection({
  title,
  images,
  currentImage,
  onSelectImage,
  onToggleWishlist,
  wishlistActive,
  discountBadge,
}: ProductGallerySectionProps) {
  const currentIndex = Math.max(
    0,
    images.findIndex((image) => image.id === currentImage?.id),
  );
  const hasMultipleImages = images.length > 1;
  const selectAdjacentImage = (direction: -1 | 1) => {
    if (!hasMultipleImages) return;
    const nextIndex =
      (currentIndex + direction + images.length) % images.length;
    onSelectImage(images[nextIndex]);
  };

  return (
    <div className="h-full min-w-0 space-y-3 sm:space-y-4">
      <div className="group/gallery relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-2xl bg-[#f7f7f5]">
        {currentImage ? (
          <>
            <Image
              key={currentImage.id}
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              priority
              className="animate-in fade-in object-contain p-3 duration-[350ms] ease-out lg:transition-transform lg:duration-500 lg:group-hover/gallery:scale-[1.035] sm:p-5"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </>
        ) : (
          <Skeleton className="h-full w-full" />
        )}

        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label={
            wishlistActive ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-3 top-3 z-20 h-10 w-10 rounded-full border border-white/80 bg-white/90 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white"
          onClick={onToggleWishlist}
        >
          <Heart
            className={`h-4 w-4 ${
              wishlistActive
                ? "fill-[#f97316] text-[#f97316]"
                : "text-[#0a0a0a]"
            }`}
          />
        </Button>

        {discountBadge?.hasDiscount && (
          <div className="absolute left-2 top-2 z-20 sm:left-3 sm:top-3">
            <Badge className="inline-flex rounded-md border-0 bg-orange-500 px-2 py-1 text-white shadow-sm hover:bg-orange-500 sm:px-2.5 sm:py-1.5">
              <span className="text-[11px] font-extrabold leading-none sm:text-xs">
                {discountBadge.savedPct}% OFF
              </span>
              <span className="ml-1 text-[8px] font-semibold leading-none text-white/90 sm:text-[9px]">
                5+ items
              </span>
            </Badge>
          </div>
        )}

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={() => selectAdjacentImage(-1)}
              aria-label="Show previous product image"
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-gray-900 shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => selectAdjacentImage(1)}
              aria-label="Show next product image"
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-gray-900 shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="scrollbar-hide w-full overflow-x-auto px-0.5">
        <div className="flex w-max min-w-full justify-start gap-2.5 pb-1 sm:justify-center">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelectImage(img)}
              aria-label={`Show ${img.altText || title}`}
              aria-pressed={img.id === currentImage?.id}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-[#f7f7f5] transition-all duration-200 sm:h-16 sm:w-16 ${
                img.id === currentImage?.id
                  ? "border-orange-500"
                  : "border-transparent opacity-80 hover:border-orange-300 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} thumbnail`}
                fill
                className="object-contain p-1"
                sizes="64px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
