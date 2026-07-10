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
    <aside className="h-full overflow-hidden rounded-2xl border border-orange-200/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.92))] px-3.5 pb-5 pt-3.5 shadow-[0_18px_45px_rgba(26,19,8,0.08)] sm:px-4 sm:pb-6 sm:pt-4">
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="rounded-full bg-[#12372a] px-2.5 py-0.5 text-[11px] text-white hover:bg-[#12372a]">
            In Stock
          </Badge>
          <Badge variant="outline" className="rounded-full border-orange-300/80 bg-white/70 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 shadow-sm">
            <Flame className="mr-1 h-3 w-3" />
            Selling fast
          </Badge>
          <span className="rounded-full border border-orange-200 bg-white/60 px-2.5 py-0.5 text-[11px] font-bold text-[#5A5E55]">
            {viewerCount} viewing now
          </span>
        </div>

        <h1 className="font-serif text-xl font-extrabold leading-tight tracking-normal text-gray-950 sm:text-2xl lg:text-[1.75rem]">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 sm:text-sm">
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
          <span className="font-bold text-gray-950">{reviewStats.averageRating.toFixed(1)}</span>
          <span>{reviewStats.totalReviews} reviews</span>
        </div>

        {priceBlock && (
          <div className="rounded-xl bg-white/65 p-2.5 shadow-sm ring-1 ring-orange-100/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                  {priceBlock.hasDiscount && priceBlock.compareAt ? (
                    <span className="pb-0.5 text-xs font-semibold text-gray-500 line-through">
                      {formatMoney(priceBlock.compareAt, priceBlock.displayPrice.currencyCode)}
                    </span>
                  ) : null}
                  <span className="text-2xl font-extrabold leading-none text-orange-600 sm:text-[1.7rem]">
                    {formatMoney(priceBlock.displayPrice.amount, priceBlock.displayPrice.currencyCode)}
                  </span>
                  {priceBlock.hasDiscount ? (
                    <Badge className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] text-white hover:bg-orange-500">
                      {priceBlock.savedPct}% OFF
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-700">
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">Only {limitedStock} left</span>
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">Ends in 02:14:36</span>
                </div>
              </div>

              <div className="shrink-0">
                <Label className="sr-only">Quantity</Label>
                <div className="flex items-center rounded-full border border-orange-200 bg-white p-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => changeQuantity(-1)}
                    disabled={quantity <= 1}
                    className="h-7 w-7 rounded-full"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold text-gray-950">{quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => changeQuantity(1)}
                    className="h-7 w-7 rounded-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="mt-1 block text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Qty
                </span>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-orange-200/80" />

        <div className="space-y-2.5">
          {options.map((option) => (
            <div key={option.name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-bold uppercase tracking-wide text-gray-700">{option.name}</Label>
                {selectedLabel ? <span className="truncate text-xs font-semibold text-gray-600">{selectedLabel}</span> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value.value}
                    type="button"
                    disabled={value.disabled}
                    onClick={() => selectOption(option.name, value.value)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                      value.selected
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-orange-200 bg-white/80 text-gray-950 hover:border-orange-400"
                    } ${value.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {value.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button onClick={onAddToCart} className="h-10 rounded-md bg-orange-500 text-xs font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)] hover:bg-orange-600 sm:text-sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add Cart
            </Button>
            <Button onClick={onBuyNow} disabled={buyLoading} className="h-10 rounded-md bg-[#1a1308] text-xs font-bold text-white hover:bg-[#2a2118] sm:text-sm">
              <Zap className="mr-2 h-4 w-4" />
              {buyLoading ? "Processing" : "Buy Now"}
            </Button>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#25D366] px-4 text-xs font-bold text-white transition hover:bg-[#1fb855] sm:text-sm"
            >
              <FaWhatsapp className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-orange-200/80 pt-2.5">
          {[
            { icon: Truck, label: "Fast Delivery", text: "All Pakistan" },
            { icon: ShieldCheck, label: "Warranty", text: "Genuine support" },
            { icon: CheckCircle, label: "Verified", text: "Quality checked" },
          ].map((item) => (
          <div key={item.label} className="text-center">
            <item.icon className="mx-auto h-3.5 w-3.5 text-orange-600" />
            <div className="mt-0.5 text-[10px] font-bold text-gray-950 sm:text-[11px]">{item.label}</div>
            <div className="text-[10px] text-gray-600">{item.text}</div>
          </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
