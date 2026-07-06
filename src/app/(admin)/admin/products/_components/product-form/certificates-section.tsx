"use client";

import { FaCertificate, FaPlus, FaTrash } from "react-icons/fa";
import { AdminImageUpload } from "@/components/admin/image-upload";
import type { SaveableSectionProps } from "./section-types";
import type { ProductCertificate } from "./types";
import { generateId } from "./utils";

export function CertificatesSection({
  values, setValues, mode, savingCertificates, saveCertificates,
}: SaveableSectionProps & { savingCertificates: boolean; saveCertificates: () => Promise<void> }) {
  const updateCertificate = (id: string, field: keyof ProductCertificate, value: string) => setValues((v) => ({ ...v, certificates: v.certificates.map((c) => (c.id === id ? { ...c, [field]: value } : c)) }));
  const removeCertificate = (id: string) => setValues((v) => ({ ...v, certificates: v.certificates.filter((c) => c.id !== id) }));

  return (
    <div className="col-span-1 rounded-xl border border-[#d8a928]/20 bg-[#fcf5e8]/60 p-4 lg:col-span-2 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6a45d]/10"><FaCertificate className="h-5 w-5 text-[#f6a45d]" /></div><div><h3 className="text-base font-semibold text-[#0a0a0a]">Certificates</h3><p className="text-xs text-[#5A5E55]">Add product certifications and awards</p></div></div>
        <button type="button" onClick={() => setValues((v) => ({ ...v, certificates: [...v.certificates, { id: generateId(), title: "", description: "", image: "" }] }))} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#f6a45d] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#d8861f] hover:shadow-md"><FaPlus className="h-4 w-4" />Add Certificate</button>
      </div>
      <div className="space-y-4">
        {values.certificates.map((cert, idx) => <CertificateCard key={cert.id} cert={cert} index={idx} updateCertificate={updateCertificate} removeCertificate={removeCertificate} />)}
        {values.certificates.length === 0 && <EmptyCertificates />}
      </div>
      {mode === "edit" && values.certificates.length > 0 && <SaveCertificatesButton saving={savingCertificates} onClick={saveCertificates} />}
    </div>
  );
}

function CertificateCard({ cert, index, updateCertificate, removeCertificate }: { cert: ProductCertificate; index: number; updateCertificate: (id: string, field: keyof ProductCertificate, value: string) => void; removeCertificate: (id: string) => void }) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <button type="button" onClick={() => removeCertificate(cert.id)} className="absolute right-3 top-3 rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"><FaTrash className="h-4 w-4" /></button>
      <p className="mb-3 text-xs font-medium text-[#5A5E55]">Certificate {index + 1}</p>
      <div className="space-y-3">
        <Input label="Title" value={cert.title} onChange={(value) => updateCertificate(cert.id, "title", value)} placeholder="e.g., Organic Certified" />
        <label className="block text-xs text-[#5A5E55]">Description<textarea value={cert.description} onChange={(e) => updateCertificate(cert.id, "description", e.target.value)} className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-[#f6a45d] focus:outline-none focus:ring-2 focus:ring-[#f6a45d]/50" rows={2} placeholder="Describe this certificate..." /></label>
        <label className="block text-xs text-[#5A5E55]">Certificate Image<AdminImageUpload label="Certificate image" folder="mmlaptop/products/certificates" usedIn="product_certificate" value={cert.image} onChange={(url) => updateCertificate(cert.id, "image", url)} /></label>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-xs text-[#5A5E55]">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-[#f6a45d] focus:outline-none focus:ring-2 focus:ring-[#f6a45d]/50" placeholder={placeholder} /></label>;
}

function EmptyCertificates() {
  return <div className="py-8 text-center"><div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6a45d]/10"><FaCertificate className="h-8 w-8 text-[#f6a45d]" /></div><p className="text-sm text-[#5A5E55]">No certificates added yet</p><p className="text-xs text-[#5A5E55]">Click "Add Certificate" to showcase your product certifications</p></div>;
}

function SaveCertificatesButton({ saving, onClick }: { saving: boolean; onClick: () => Promise<void> }) {
  return <div className="mt-4 flex justify-end"><button type="button" onClick={onClick} disabled={saving} className="rounded-lg bg-[#f6a45d] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#d8861f] hover:shadow-md disabled:opacity-50">{saving ? "Saving..." : "Save Certificates"}</button></div>;
}
