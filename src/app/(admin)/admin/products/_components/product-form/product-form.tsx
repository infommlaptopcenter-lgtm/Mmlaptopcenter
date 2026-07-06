"use client";

import Link from "next/link";
import type { ProductFormValues } from "./types";
import { BasicInfoSection, CertificatesSection, DetailsSection, VariationsSection } from "./sections";
import { FormFooter } from "./form-footer";
import { useProductForm } from "./use-product-form";

export function ProductForm({
  mode,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}) {
  const form = useProductForm({ mode, productId, initialValues });

  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0a0a0a]">{mode === "create" ? "Add Product" : "Edit Product"}</h1>
          <p className="mt-1 text-sm text-[#5A5E55]">Product mapping includes category, subcategory and collections.</p>
        </div>
        <Link href="/admin/products" className="rounded-lg border border-[#d8a928]/25 bg-white px-4 py-2 text-sm font-medium text-[#0a0a0a] hover:bg-[#fcf5e8] transition-all">
          Back to Products
        </Link>
      </div>

      {form.error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</div>
      ) : null}

      <form onSubmit={form.onSubmit} className="grid gap-6 rounded-xl border border-[#d8a928]/20 bg-white p-6 md:p-8 lg:grid-cols-2">
        <BasicInfoSection
          values={form.values}
          setValues={form.setValues}
          parentCategories={form.parentCategories}
          subcategories={form.subcategories}
          collectionSearch={form.collectionSearch}
          setCollectionSearch={form.setCollectionSearch}
          visibleCollections={form.visibleCollections}
          categories={form.categories}
        />

        <VariationsSection
          values={form.values}
          setValues={form.setValues}
          mode={mode}
          savingVariations={form.savingVariations}
          saveVariations={form.saveVariations}
          price={form.values.price}
        />

        <DetailsSection
          values={form.values}
          setValues={form.setValues}
          mode={mode}
          savingDetails={form.savingDetails}
          saveDetails={form.saveDetails}
        />

        <CertificatesSection
          values={form.values}
          setValues={form.setValues}
          mode={mode}
          savingCertificates={form.savingCertificates}
          saveCertificates={form.saveCertificates}
        />

        <FormFooter mode={mode} saving={form.saving} />
      </form>
    </div>
  );
}
