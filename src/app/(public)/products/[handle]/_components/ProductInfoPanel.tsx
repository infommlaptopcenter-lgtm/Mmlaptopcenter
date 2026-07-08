"use client";

import { FaWhatsapp } from "react-icons/fa";
import { Badge } from "@esmate/shadcn/components/ui/badge";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Label } from "@esmate/shadcn/components/ui/label";
import { Separator } from "@esmate/shadcn/components/ui/separator";
import {
  CheckCircle,
  Flame,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Users,
  Zap,
} from "@esmate/shadcn/pkgs/lucide-react";
import { formatMoney, type PriceBlock, type ReviewStats } from "./product-page-utils";

type VariantOption = {
  name: string;
  values: Array<{ value: string; selected?: boolean; disabled?: boolean }>;
};

type ProductInfoPanelProps = {
  title: string;
  priceBlock: PriceBlock | null;
  reviewStats: ReviewStats;
  inventory: number | null;
  options: VariantOption[];
  selectOption: (name: string, value: string) => void;
  quantity: number;
  changeQuantity: (amount: number) => void;
  selectedLabel: string;
  buyLoading: boolean;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  whatsAppHref: string;
};

export function ProductInfoPanel({
  title,
  priceBlock,
  reviewStats,
  inventory,
  options,
  selectOption,
  quantity,
  changeQuantity,
  selectedLabel,
  buyLoading,
  onAddToCart,
  onBuyNow,
  whatsAppHref,
}: ProductInfoPanelProps) {
  const limitedStock = inventory === null ? 7 : Math.max(1, Math.min(inventory, 9));
  const viewerCount = 18 + (title.length % 24);

  return (
    <aside className="space-y-3">
      <div className="rounded-xl border border-[#d8a928]/20 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#12372a] text-white hover:bg-[#12372a]">In Stock</Badge>
          <Badge variant="outline" className="border-[#d8a928]/30 bg-[#f4f1e8] text-[#8b1a1a]">
            <Flame className="mr-1 h-3 w-3" />
            Selling fast
          </Badge>
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#0a0a0a] sm:text-3xl">
          {title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#5A5E55]">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(reviewStats.averageRating)
                    ? "fill-[#d8a928] text-[#d8a928]"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-[#0a0a0a]">{reviewStats.averageRating.toFixed(1)}</span>
          <span>{reviewStats.totalReviews} reviews</span>
          <span className="hidden h-1 w-1 rounded-full bg-[#d8a928] sm:block" />
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" />
            {viewerCount} viewing now
          </span>
        </div>

        {priceBlock && (
          <div className="mt-5 rounded-lg border border-[#d8a928]/15 bg-[#f4f1e8] p-3">
            <div className="flex flex-wrap items-end gap-2">
              {priceBlock.hasDiscount && priceBlock.compareAt ? (
                <span className="pb-1 text-sm font-medium text-gray-500 line-through">
                  {formatMoney(priceBlock.compareAt, priceBlock.displayPrice.currencyCode)}
                </span>
              ) : null}
              <span className="text-3xl font-extrabold leading-none text-[#8b1a1a]">
                {formatMoney(priceBlock.displayPrice.amount, priceBlock.displayPrice.currencyCode)}
              </span>
              {priceBlock.hasDiscount ? (
                <Badge className="bg-[#8b1a1a] text-white hover:bg-[#8b1a1a]">
                  {priceBlock.savedPct}% OFF
                </Badge>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5A5E55]">
              <span className="rounded-full bg-white px-2 py-1">Limited stock: only {limitedStock} left</span>
              <span className="rounded-full bg-white px-2 py-1">Deal ends in 02:14:36</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#d8a928]/20 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#0a0a0a]">Configure</h2>
          {selectedLabel ? <span className="text-xs text-[#5A5E55]">{selectedLabel}</span> : null}
        </div>
        <Separator className="my-3 bg-[#d8a928]/20" />

        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.name} className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-[#5A5E55]">{option.name}</Label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value.value}
                    type="button"
                    disabled={value.disabled}
                    onClick={() => selectOption(option.name, value.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      value.selected
                        ? "border-[#8b1a1a] bg-[#8b1a1a] text-white"
                        : "border-[#d8a928]/30 bg-white text-[#0a0a0a] hover:border-[#8b1a1a]"
                    } ${value.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {value.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f4f1e8] p-3">
            <Label className="text-sm font-bold text-[#0a0a0a]">Quantity</Label>
            <div className="flex items-center rounded-full border border-[#d8a928]/30 bg-white p-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => changeQuantity(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-bold text-[#0a0a0a]">{quantity}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => changeQuantity(1)}
                className="h-8 w-8 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button onClick={onAddToCart} className="h-11 rounded-lg bg-[#8b1a1a] text-white hover:bg-[#a52020]">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add Cart
            </Button>
            <Button onClick={onBuyNow} disabled={buyLoading} className="h-11 rounded-lg bg-[#111111] text-white hover:bg-[#262626]">
              <Zap className="mr-2 h-4 w-4" />
              {buyLoading ? "Processing" : "Buy Now"}
            </Button>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white transition hover:bg-[#1fb855]"
            >
              <FaWhatsapp className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Truck, label: "Fast Delivery", text: "All Pakistan" },
          { icon: ShieldCheck, label: "Warranty", text: "Genuine support" },
          { icon: CheckCircle, label: "Verified", text: "Quality checked" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-[#d8a928]/20 bg-white p-3 text-center shadow-sm">
            <item.icon className="mx-auto h-5 w-5 text-[#8b1a1a]" />
            <div className="mt-1 text-xs font-bold text-[#0a0a0a]">{item.label}</div>
            <div className="text-[10px] text-[#5A5E55]">{item.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
