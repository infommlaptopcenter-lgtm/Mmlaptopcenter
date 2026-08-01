"use client";

import type { CheckoutDetails } from "./checkout-types";

const inputClass = "mt-1 w-full rounded-lg border border-[#d8a928]/30 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#f6a45d] focus:ring-2 focus:ring-[#f6a45d]/20";

export function CheckoutCustomerForm({ values, setValue }: { values: CheckoutDetails; setValue: (key: keyof CheckoutDetails, value: string) => void }) {
  const field = (key: keyof CheckoutDetails, label: string, required = false, type = "text") => <label className="block text-sm font-semibold text-[#1a1308]">{label}<input type={type} required={required} value={values[key]} onChange={(event) => setValue(key, event.target.value)} className={inputClass} /></label>;
  return <section className="rounded-2xl border border-[#d8a928]/25 bg-white p-5">
    <h2 className="font-serif text-xl font-extrabold text-[#1a1308]">Delivery details</h2>
    <p className="mt-1 text-sm text-[#5A5E55]">We’ll use these details to confirm and deliver your order.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("customerName", "Full name", true)}</div>
      {field("customerPhone", "WhatsApp / phone *", true, "tel")}
      {field("customerEmail", "Email (optional)", false, "email")}
      <div className="sm:col-span-2">{field("line1", "Address", true)}</div>
      <div className="sm:col-span-2">{field("line2", "Apartment, floor or landmark (optional)")}</div>
      {field("city", "City *", true)}
      {field("state", "Province / state")}
      {field("pincode", "Postal code")}
      <label className="block text-sm font-semibold text-[#1a1308]">Order notes<textarea rows={3} value={values.notes} onChange={(event) => setValue("notes", event.target.value)} className={inputClass} placeholder="Delivery instructions or anything we should know" /></label>
    </div>
    <p className="mt-4 rounded-lg bg-[#fcf5e8] px-3 py-2 text-xs text-[#5A5E55]">Use a Pakistani mobile number such as 0300 1234567. We use it for order confirmation and delivery updates.</p>
  </section>;
}
