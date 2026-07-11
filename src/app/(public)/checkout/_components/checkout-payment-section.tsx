"use client";

import { useRef, useState } from "react";
import { Banknote, Building2, Upload } from "@esmate/shadcn/pkgs/lucide-react";
import { COD_LIMIT, paymentAccounts, type PaymentMethod } from "./checkout-types";

export function CheckoutPaymentSection({ subtotal, method, setMethod, proofUrl, setProofUrl, reference, setReference }: { subtotal: number; method: PaymentMethod; setMethod: (method: PaymentMethod) => void; proofUrl: string; setProofUrl: (url: string) => void; reference: string; setReference: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const codAvailable = subtotal <= COD_LIMIT;

  async function uploadProof(file: File) {
    setUploading(true);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/orders/payment-proof", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setProofUrl(data.url);
    } finally { setUploading(false); }
  }

  return <section className="rounded-2xl border border-[#d8a928]/25 bg-white p-5">
    <h2 className="font-serif text-xl font-extrabold text-[#1a1308]">Payment method</h2>
    <p className="mt-1 text-sm text-[#5A5E55]">Choose how you want to complete your order.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <button type="button" disabled={!codAvailable} onClick={() => setMethod("cod")} className={`rounded-xl border p-4 text-left transition ${method === "cod" ? "border-[#d8861f] bg-[#fcf5e8] ring-2 ring-[#f6a45d]/25" : "border-gray-200"} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-55`}><Banknote className="h-5 w-5 text-[#c86f2d]" /><span className="mt-2 block font-bold text-[#1a1308]">Cash on delivery</span><span className="text-xs text-[#5A5E55]">Available up to Rs. {COD_LIMIT.toLocaleString()}</span></button>
      <button type="button" onClick={() => setMethod("manual_transfer")} className={`rounded-xl border p-4 text-left transition ${method === "manual_transfer" ? "border-[#d8861f] bg-[#fcf5e8] ring-2 ring-[#f6a45d]/25" : "border-gray-200"}`}><Building2 className="h-5 w-5 text-[#c86f2d]" /><span className="mt-2 block font-bold text-[#1a1308]">Pay manually</span><span className="text-xs text-[#5A5E55]">Easypaisa or bank transfer</span></button>
    </div>
    {!codAvailable ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">COD is unavailable above Rs. {COD_LIMIT.toLocaleString()}. Please use manual payment.</p> : null}
    {method === "manual_transfer" ? <div className="mt-5 space-y-4 border-t border-[#d8a928]/15 pt-5">
      <div className="grid gap-3 sm:grid-cols-2">{paymentAccounts.map((account) => <div key={account.name} className="rounded-xl bg-[#fcf5e8] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#c86f2d]">{account.name}</p><p className="mt-1 font-bold text-[#1a1308]">{account.title}</p><p className="text-sm text-[#5A5E55]">{account.number}</p>{account.detail ? <p className="text-xs text-[#5A5E55]">{account.detail}</p> : null}</div>)}</div>
      <label className="block text-sm font-semibold text-[#1a1308]">Transaction ID / reference<input value={reference} onChange={(event) => setReference(event.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#f6a45d] focus:outline-none focus:ring-2 focus:ring-[#f6a45d]/30" /></label>
      <div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadProof(file); }} /><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-lg border border-[#d8a928]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#1a1308] hover:bg-[#fcf5e8] disabled:opacity-60"><Upload className="h-4 w-4" />{uploading ? "Uploading..." : proofUrl ? "Replace transaction screenshot" : "Upload transaction screenshot"}</button>{proofUrl ? <p className="mt-2 text-xs font-semibold text-green-700">Screenshot uploaded successfully. Admin will verify it.</p> : null}</div>
    </div> : null}
    <div className="mt-5 rounded-xl border border-dashed border-[#d8a928]/30 px-4 py-3 text-xs text-[#5A5E55]"><strong className="text-[#1a1308]">Coming later:</strong> secure card payments with Stripe and direct Easypaisa integration.</div>
  </section>;
}
