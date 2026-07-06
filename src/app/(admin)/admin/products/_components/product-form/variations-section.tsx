"use client";

import { FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import type { SaveableSectionProps } from "./section-types";

export function VariationsSection({
  values, setValues, mode, savingVariations, saveVariations, price,
}: SaveableSectionProps & { savingVariations: boolean; saveVariations: () => Promise<void>; price: number }) {
  return (
    <div className="col-span-1 rounded-xl border border-[#d8a928]/20 bg-[#fcf5e8]/60 p-4 lg:col-span-2 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6a45d]/10"><FaInfoCircle className="h-5 w-5 text-[#f6a45d]" /></div><div><h3 className="text-base font-semibold text-[#0a0a0a]">Product Variations</h3><p className="text-xs text-[#5A5E55]">Add different options like size, color, or material</p></div></div>
        <button type="button" onClick={() => setValues((v) => ({ ...v, variations: [...v.variations, { name: "", value: "", price }] }))} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#f6a45d] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#d8861f] hover:shadow-md"><FaPlus className="h-4 w-4" />Add Variation</button>
      </div>
      <div className="space-y-4">
        {values.variations.map((variation, idx) => (
          <div key={idx} className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <button type="button" onClick={() => setValues((v) => ({ ...v, variations: v.variations.filter((_, i) => i !== idx) }))} className="absolute right-3 top-3 rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"><FaTrash className="h-4 w-4" /></button>
            <p className="mb-3 text-xs font-medium text-[#5A5E55]">Variation {idx + 1}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Option Name" value={variation.name} placeholder="e.g., Color" onChange={(value) => setValues((v) => ({ ...v, variations: v.variations.map((item, i) => (i === idx ? { ...item, name: value } : item)) }))} />
              <Field label="Option Value" value={variation.value} placeholder="e.g., Blue" onChange={(value) => setValues((v) => ({ ...v, variations: v.variations.map((item, i) => (i === idx ? { ...item, value } : item)) }))} />
              <Field label="Price Adjustment" type="number" value={variation.price} placeholder="0.00" onChange={(value) => setValues((v) => ({ ...v, variations: v.variations.map((item, i) => (i === idx ? { ...item, price: Number(value) } : item)) }))} />
            </div>
          </div>
        ))}
        {values.variations.length === 0 && <EmptyVariations />}
      </div>
      {mode === "edit" && values.variations.length > 0 && <SaveButton saving={savingVariations} onClick={saveVariations} />}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <div><label className="mb-1.5 block text-xs text-[#5A5E55]">{label}</label><input type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-[#f6a45d] focus:outline-none focus:ring-2 focus:ring-[#f6a45d]/50" placeholder={placeholder} /></div>;
}

function EmptyVariations() {
  return <div className="py-8 text-center"><div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6a45d]/10"><FaInfoCircle className="h-8 w-8 text-[#f6a45d]" /></div><p className="text-sm text-[#5A5E55]">No variations added yet</p><p className="text-xs text-[#5A5E55]">Click "Add Variation" to create product options</p></div>;
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => Promise<void> }) {
  return <div className="mt-4 flex justify-end"><button type="button" onClick={onClick} disabled={saving} className="rounded-lg bg-[#f6a45d] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#d8861f] hover:shadow-md disabled:opacity-50">{saving ? "Saving..." : "Save Variations"}</button></div>;
}
