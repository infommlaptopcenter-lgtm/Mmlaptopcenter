"use client";

import Image from "next/image";
import { CheckCircle, PackageX } from "@esmate/shadcn/pkgs/lucide-react";
import { formatMoney } from "./product-page-utils";

export type VariantCardItem = {
  id: string; name?: string; availableForSale: boolean; price: { amount: string; currencyCode: string };
  images?: Array<{ id: string; url: string; altText: string | null; width: number; height: number }>;
  selectedOptions: Array<{ name: string; value: string }>; specifications?: Record<string, string>;
};

export function ProductVariantsSection({ variants, selectedId, fallbackImage, onSelect }: { variants: VariantCardItem[]; selectedId?: string | null; fallbackImage?: string; onSelect: (id: string) => void }) {
  if (!variants.length) return null;
  return (
    <section className="space-y-5">
      <div><span className="text-xs font-bold uppercase tracking-wider text-orange-600">Available configurations</span><h2 className="font-serif text-2xl font-extrabold text-gray-950 sm:text-3xl">Product Variants</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {variants.map((variant) => {
          const image = variant.images?.[0]?.url || fallbackImage;
          return <button key={variant.id} type="button" disabled={!variant.availableForSale} onClick={() => onSelect(variant.id)} className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${selectedId === variant.id ? "border-orange-500 ring-2 ring-orange-300" : "border-orange-100"} disabled:cursor-not-allowed disabled:opacity-60`}>
            <div className="relative aspect-[4/3] bg-[#f4f1e8]">{image ? <Image src={image} alt={variant.name || "Product variant"} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-contain p-3" /> : null}</div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 font-serif text-lg font-extrabold text-gray-950">{variant.name || "Product variant"}</h3>
              <p className="text-lg font-extrabold text-orange-600">{formatMoney(variant.price.amount, variant.price.currencyCode)}</p>
              <div className="flex flex-wrap gap-1">{variant.selectedOptions.slice(0, 4).map((option) => <span key={option.name} className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-800">{option.name}: {option.value}</span>)}</div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${variant.availableForSale ? "text-green-700" : "text-red-600"}`}>{variant.availableForSale ? <CheckCircle className="h-4 w-4" /> : <PackageX className="h-4 w-4" />}{variant.availableForSale ? "In Stock" : "Out of Stock"}</div>
            </div>
          </button>;
        })}
      </div>
    </section>
  );
}
