"use client";

import { AdminImageUpload } from "@/components/admin/image-upload";
import { AttributesFields } from "./attributes-fields";
import type { ProductFormValues, ProductVariantFormValue } from "./types";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#f6a45d] focus:outline-none focus:ring-2 focus:ring-[#f6a45d]/40";

function inheritedVariant(product: ProductFormValues): ProductVariantFormValue {
  return {
    id: crypto.randomUUID(), name: product.title, description: product.description, price: product.price,
    compareAtPrice: product.compareAtPrice, sku: product.sku, stock: product.inventory, images: [...product.images],
    color: product.color, size: product.size, storage: product.storage, ram: product.ram, processor: product.processor,
    condition: product.condition, specifications: { ...product.specifications }, customAttributes: { ...product.customAttributes },
    active: true, isDefault: product.variants.length === 0,
  };
}

export function VariantsSection({ values, setValues }: { values: ProductFormValues; setValues: React.Dispatch<React.SetStateAction<ProductFormValues>> }) {
  const update = (id: string, patch: Partial<ProductVariantFormValue>) => setValues((current) => ({ ...current, variants: current.variants.map((variant) => variant.id === id ? { ...variant, ...patch } : variant) }));
  const remove = (id: string) => setValues((current) => ({ ...current, variants: current.variants.filter((variant) => variant.id !== id) }));
  const makeDefault = (id: string) => setValues((current) => ({ ...current, variants: current.variants.map((variant) => ({ ...variant, isDefault: variant.id === id })) }));
  return (
    <section className="space-y-4 rounded-xl border border-[#d8a928]/25 bg-[#fcf5e8]/40 p-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-gray-950">Product Variants</h2><p className="text-xs text-gray-500">New variants inherit the current main-product details.</p></div><button type="button" onClick={() => setValues((current) => ({ ...current, variants: [...current.variants, inheritedVariant(current)] }))} className="rounded-lg bg-[#1a1308] px-4 py-2 text-sm font-bold text-white">Add Variant</button></div>
      {values.variants.map((variant, index) => (
        <details key={variant.id} open={index === values.variants.length - 1} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-bold text-gray-900">{variant.name || `Variant ${index + 1}`} {variant.isDefault ? <span className="ml-2 text-xs text-orange-600">Default</span> : null}</summary>
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input className={inputClass} placeholder="Variant name" value={variant.name} onChange={(e) => update(variant.id, { name: e.target.value })} />
              <input className={inputClass} placeholder="SKU" value={variant.sku || ""} onChange={(e) => update(variant.id, { sku: e.target.value })} />
              <input className={inputClass} type="number" min={0} step="0.01" placeholder="Price" value={variant.price} onChange={(e) => update(variant.id, { price: Number(e.target.value) })} />
              <input className={inputClass} type="number" min={0} step="0.01" placeholder="Compare price" value={variant.compareAtPrice ?? ""} onChange={(e) => update(variant.id, { compareAtPrice: e.target.value ? Number(e.target.value) : null })} />
              <input className={inputClass} type="number" min={0} placeholder="Stock" value={variant.stock} onChange={(e) => update(variant.id, { stock: Number(e.target.value) })} />
              <textarea className={`${inputClass} sm:col-span-2 lg:col-span-3`} placeholder="Description" value={variant.description || ""} onChange={(e) => update(variant.id, { description: e.target.value })} />
            </div>
            <AttributesFields value={variant} onChange={(patch) => update(variant.id, patch)} />
            <AdminImageUpload label="Variant Images" folder="mmlaptop/products/variants" usedIn="product variant" mode="multiple" values={variant.images} onChangeMany={(images) => update(variant.id, { images })} />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={variant.active} onChange={(e) => update(variant.id, { active: e.target.checked })} /> Active</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name="defaultVariant" checked={variant.isDefault} onChange={() => makeDefault(variant.id)} /> Default variant</label>
              <button type="button" onClick={() => setValues((current) => ({ ...current, variants: [...current.variants, { ...variant, id: crypto.randomUUID(), name: `${variant.name} Copy`, isDefault: false }] }))} className="text-sm font-bold text-blue-700">Duplicate</button>
              <button type="button" onClick={() => remove(variant.id)} className="text-sm font-bold text-red-600">Delete</button>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}
