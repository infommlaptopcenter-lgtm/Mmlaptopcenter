import Image from "next/image";
import { Badge } from "@esmate/shadcn/components/ui/badge";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Skeleton } from "@esmate/shadcn/components/ui/skeleton";
import { Heart, Package, RefreshCw, Shield, Truck } from "@esmate/shadcn/pkgs/lucide-react";

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
  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-2xl border border-[#d8a928]/20 bg-white shadow-md lg:max-w-full">
        <div className="absolute inset-0 bg-[#fcf5e8]" />
        {currentImage ? (
          <>
            <Image
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              priority
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-transparent" />
          </>
        ) : (
          <Skeleton className="h-full w-full" />
        )}

        <Button
          size="icon"
          variant="secondary"
          className="absolute right-3 top-3 h-8 w-8 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
          onClick={onToggleWishlist}
        >
          <Heart className={`h-4 w-4 ${wishlistActive ? "fill-[#d8a928] text-[#d8a928]" : "text-[#0a0a0a]"}`} />
        </Button>

        {discountBadge?.hasDiscount && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-[#d8a928] px-2 py-1 text-xs font-semibold text-[#0a0a0a] shadow">
              -{discountBadge.savedPct}%
            </Badge>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex justify-center gap-2 pb-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => onSelectImage(img)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white sm:h-16 sm:w-16 ${
                img.id === currentImage?.id
                  ? "border-[#f6a45d] ring-2 ring-[#f6a45d] ring-offset-1"
                  : "border-transparent hover:border-[#f6a45d]/40"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Truck, label: "Fast Delivery", desc: "Nationwide" },
          { icon: Shield, label: "Secure", desc: "Safe checkout" },
          { icon: RefreshCw, label: "Easy Returns", desc: "30 days" },
          { icon: Package, label: "Gift Ready", desc: "Free wrap" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-[#d8a928]/20 bg-white p-2 text-center">
            <item.icon className="mx-auto mb-1 h-4 w-4 text-[#f6a45d]" />
            <div className="text-xs font-semibold text-[#0a0a0a]">{item.label}</div>
            <div className="text-[10px] text-[#5A5E55]">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
