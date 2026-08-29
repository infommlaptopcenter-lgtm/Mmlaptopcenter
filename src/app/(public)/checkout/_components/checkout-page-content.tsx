"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/lib/commerce";
import { addPaymentInfo, contact as trackContact, extractNameParts, purchase, type MetaEventParameters, type MetaUserData } from "@/lib/pixel";
import { ADMIN_WHATSAPP_NUMBER, isValidWhatsAppNumber } from "@/lib/whatsapp";
import { calculateOrderPricing } from "@/lib/order-pricing";
import { CheckoutCustomerForm } from "./checkout-customer-form";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutPaymentSection } from "./checkout-payment-section";
import { COD_LIMIT, JAZZCASH_LIMIT, type CheckoutDetails, type PaymentMethod } from "./checkout-types";

const initialDetails: CheckoutDetails = { customerName: "", customerEmail: "", customerPhone: "", line1: "", line2: "", city: "", state: "", pincode: "", notes: "" };

export function CheckoutPageContent() {
  const router = useRouter();
  const cart = useCart();
  const subtotal = useMemo(() => cart.lines.reduce((sum, line) => sum + Number(line.cost.totalAmount.amount), 0), [cart.lines]);
  const [details, setDetails] = useState(initialDetails);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const isEmpty = (cart.totalQuantity ?? 0) === 0;
  const pricing = useMemo(
    () => calculateOrderPricing(subtotal, paymentMethod === "cod"),
    [subtotal, paymentMethod],
  );
  const codTotal = useMemo(() => calculateOrderPricing(subtotal, true).total, [subtotal]);
  const prepaidTotal = useMemo(() => calculateOrderPricing(subtotal, false).total, [subtotal]);
  const cartEventParameters = useMemo<MetaEventParameters>(() => ({
    content_ids: cart.lines.map((line) => line.merchandise.product.id || line.merchandise.id.replace(/-simple$/, "")),
    contents: cart.lines.map((line) => ({
      id: line.merchandise.product.id || line.merchandise.id.replace(/-simple$/, ""),
      quantity: line.quantity,
      item_price: Number(line.merchandise.price.amount),
      variant: line.merchandise.selectedOptions.map((option) => `${option.name}: ${option.value}`).join(", ") || undefined,
    })),
    content_type: "product",
    value: pricing.total,
    currency: "PKR",
    num_items: cart.totalQuantity,
  }), [cart.lines, cart.totalQuantity, pricing.total]);

  const customerMatchingData = useMemo<MetaUserData>(() => {
    const { fn, ln } = extractNameParts(details.customerName);
    return {
      em: details.customerEmail.trim() || undefined,
      ph: details.customerPhone.trim() || undefined,
      fn,
      ln,
      ct: details.city.trim() || undefined,
      st: details.state.trim() || undefined,
      zp: details.pincode.trim() || undefined,
      country: "pk",
    };
  }, [details]);

  useEffect(() => {
    if (codTotal > COD_LIMIT && paymentMethod === "cod") setPaymentMethod("bank_transfer");
    if (prepaidTotal > JAZZCASH_LIMIT && paymentMethod === "jazzcash") setPaymentMethod("bank_transfer");
  }, [codTotal, prepaidTotal, paymentMethod]);

  const whatsappMessage = encodeURIComponent(`Hi MM Laptop Center, I need help with my checkout. Total: Rs. ${pricing.total.toLocaleString()}. Name: ${details.customerName || "Not entered"}. Phone: ${details.customerPhone || "Not entered"}.`);

  function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    if (isEmpty) return;
    if (!isValidWhatsAppNumber(details.customerPhone)) return setError("Please enter a valid WhatsApp or phone number.");
    if (paymentMethod === "cod" && codTotal > COD_LIMIT) return setError(`Cash on delivery is only available up to Rs. ${COD_LIMIT.toLocaleString()}.`);
    if (paymentMethod === "jazzcash" && prepaidTotal > JAZZCASH_LIMIT) return setError(`JazzCash is only available up to Rs. ${JAZZCASH_LIMIT.toLocaleString()}.`);
    if (paymentMethod !== "cod" && !paymentProofUrl) return setError("Please upload the payment screenshot.");
    setError(null);
    setReviewing(true);
  }

  async function confirmOrder() {
    setSubmitting(true); setError(null);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        customerName: details.customerName.trim(), customerEmail: details.customerEmail.trim() || undefined, customerPhone: details.customerPhone.trim(),
        customerAddress: { line1: details.line1, line2: details.line2 || undefined, city: details.city, state: details.state || undefined, pincode: details.pincode || undefined, country: "PK" },
        items: cart.lines.map((line) => ({ productId: line.merchandise.id.replace(/-simple$/, ""), quantity: line.quantity })),
        paymentMethod, paymentProofUrl: paymentProofUrl || undefined, notes: details.notes || undefined,
      }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to place order");
      purchase(
        { ...cartEventParameters, value: data.order.total ?? pricing.total, order_id: data.order.orderNumber },
        { ...customerMatchingData, external_id: data.order.orderNumber }
      );
      cart.clear(); router.push(`/checkout/success?orderNumber=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Failed to place order"); setReviewing(false); } finally { setSubmitting(false); }
  }

  if (isEmpty) return <main className="min-h-screen bg-[#fcf5e8] px-6 py-16"><div className="mx-auto max-w-xl rounded-2xl border border-[#d8a928]/20 bg-white p-8 text-center"><h1 className="font-serif text-3xl font-extrabold text-[#1a1308]">Your cart is empty</h1><p className="mt-2 text-sm text-[#5A5E55]">Add a laptop or accessory before checking out.</p><Link href="/products" className="mt-6 inline-flex rounded-full bg-[#f6a45d] px-6 py-3 text-sm font-bold text-white hover:bg-[#d8861f]">Explore products</Link></div></main>;

  return <main className="min-h-screen bg-[#fcf5e8] px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-6xl">
    <div className="mb-7"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c86f2d]">Secure order</span><h1 className="mt-1 font-serif text-3xl font-extrabold text-[#1a1308] sm:text-4xl">Complete your purchase</h1><p className="mt-2 max-w-2xl text-sm text-[#5A5E55]">Review your items, choose payment, and share accurate delivery information.</p></div>
    <form onSubmit={placeOrder} className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
        <CheckoutCustomerForm values={details} setValue={(key, value) => setDetails((current) => ({ ...current, [key]: value }))} />
        <CheckoutPaymentSection subtotal={subtotal} method={paymentMethod} setMethod={setPaymentMethod} proofUrl={paymentProofUrl} setProofUrl={setPaymentProofUrl} onProofUploaded={() => addPaymentInfo(cartEventParameters, customerMatchingData)} />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button type="submit" disabled={submitting} className="min-w-0 whitespace-nowrap rounded-lg bg-[#f6a45d] px-2 py-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#d8861f] disabled:opacity-50 sm:px-3 sm:py-3 sm:text-sm">{submitting ? "Placing order..." : paymentMethod === "cod" ? "Place COD order" : "Submit payment"}</button>
          <a href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContact("WhatsApp checkout help")} className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-green-700 px-2 py-2.5 text-[11px] font-bold text-white hover:bg-green-800 sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"><FaWhatsapp className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" /> WhatsApp help</a>
        </div>
        <p className="text-center text-xs text-[#5A5E55]">Bank Transfer and JazzCash payments remain pending until an administrator verifies the transaction.</p>
      </div>
      <CheckoutOrderSummary cart={cart} subtotal={subtotal} paymentMethod={paymentMethod} />
    </form>
    {reviewing ? <OrderReviewModal details={details} paymentMethod={paymentMethod} total={pricing.total} submitting={submitting} onEdit={() => setReviewing(false)} onConfirm={confirmOrder} /> : null}
  </div></main>;
}

function OrderReviewModal({ details, paymentMethod, total, submitting, onEdit, onConfirm }: { details: CheckoutDetails; paymentMethod: PaymentMethod; total: number; submitting: boolean; onEdit: () => void; onConfirm: () => void }) {
  const address = [details.line1, details.line2, details.city, details.state, details.pincode].filter(Boolean).join(", ");
  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="review-title">
    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c86f2d]">Final check</p><h2 id="review-title" className="mt-1 text-xl font-extrabold text-[#1a1308]">Confirm your details</h2></div><span className="rounded-full bg-[#fcf5e8] px-3 py-1 text-xs font-bold text-[#c86f2d]">PKR {total.toLocaleString()}</span></div>
      <p className="mt-2 text-sm text-[#5A5E55]">Please verify your name, contact number and delivery address before placing the order.</p>
      <dl className="mt-5 divide-y divide-[#d8a928]/15 rounded-xl border border-[#d8a928]/25">
        <ReviewRow label="Customer" value={details.customerName} /><ReviewRow label="WhatsApp / phone" value={details.customerPhone} /><ReviewRow label="Email" value={details.customerEmail || "Not provided"} /><ReviewRow label="Delivery address" value={address} /><ReviewRow label="Payment" value={paymentMethod.replaceAll("_", " ")} />
      </dl>
      <label className="mt-4 flex items-start gap-2 text-xs text-[#5A5E55]"><input type="checkbox" required defaultChecked className="mt-0.5 accent-[#f6a45d]" />I confirm these contact and delivery details are correct.</label>
      <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={onEdit} disabled={submitting} className="rounded-lg border border-[#d8a928]/35 px-4 py-2.5 text-sm font-bold text-[#1a1308] hover:bg-[#fcf5e8]">Edit details</button><button type="button" onClick={onConfirm} disabled={submitting} className="rounded-lg bg-[#f6a45d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d8861f] disabled:opacity-50">{submitting ? "Placing..." : "Confirm & place order"}</button></div>
    </div>
  </div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[110px_1fr] gap-3 px-3 py-2.5 text-sm"><dt className="font-semibold text-[#5A5E55]">{label}</dt><dd className="break-words font-medium capitalize text-[#1a1308]">{value}</dd></div>;
}
