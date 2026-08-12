"use client";

import { useEffect, useState } from "react";
import { buildOrderConfirmationMessage, buildOrderDetailsMessage, formatPhoneForWhatsApp, isValidWhatsAppNumber, Order } from "@/lib/whatsapp";
import type { OrderDetail } from "./types";

export function useOrderDetail(id?: string) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ orderStatus: "pending", paymentStatus: "pending", trackingNumber: "", trackingUrl: "", courierName: "", estimatedDelivery: "", notes: "" });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function run() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load order");
        if (cancelled) return;
        setOrder(data);
        setForm({ orderStatus: data.orderStatus ?? "pending", paymentStatus: data.paymentStatus ?? "pending", trackingNumber: data.trackingNumber ?? "", trackingUrl: data.trackingUrl ?? "", courierName: data.courierName ?? "", estimatedDelivery: data.estimatedDelivery?.slice(0, 10) ?? "", notes: data.notes ?? "" });
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [id]);

  async function save() {
    if (!id) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update order");
      const updatedOrder = order ? { ...order, ...data } : null;
      setOrder(updatedOrder);
      const openTrackingMessage = updatedOrder?.orderStatus === "confirmed" && !!updatedOrder.trackingNumber && !!updatedOrder.customerPhone;
      if (openTrackingMessage && assertWhatsAppPhone(updatedOrder.customerPhone!)) {
        window.open(`https://wa.me/${formatPhoneForWhatsApp(updatedOrder.customerPhone!)}?text=${encodeURIComponent(buildOrderConfirmationMessage(updatedOrder as Order))}`, "_blank");
      }
      setNotice(data.emailSent ? "Tracking saved and email sent. WhatsApp message opened." : data.emailError ? `Tracking saved. Email failed: ${data.emailError}` : openTrackingMessage ? "Tracking saved. WhatsApp message opened." : "Order changes saved successfully.");
    } catch (e: any) {
      setError(e?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  }

  async function sendConfirmationEmail() {
    if (!id || !order?.customerEmail) return;
    setSendingEmail(true); setError(null); setNotice(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}/status`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Email could not be sent");
      setOrder((current) => current ? { ...current, confirmationEmailSentAt: data.confirmationEmailSentAt } : current);
      setNotice(`Confirmation email sent to ${order.customerEmail}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Email could not be sent");
    } finally { setSendingEmail(false); }
  }

  function openCustomerWhatsApp() {
    const phone = order?.customerPhone;
    if (!phone || !assertWhatsAppPhone(phone)) return;
    window.open(`https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(buildOrderDetailsMessage(order as Order))}`, "_blank");
  }

  function sendOrderConfirmation() {
    const phone = order?.customerPhone;
    if (!phone || !assertWhatsAppPhone(phone)) return;
    setSendingWhatsApp(true); setWhatsAppSuccess(null);
    setTimeout(() => {
      window.open(`https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(buildOrderConfirmationMessage(order as Order))}`, "_blank");
      setSendingWhatsApp(false);
      setWhatsAppSuccess("WhatsApp opened! Message ready to send.");
      setTimeout(() => setWhatsAppSuccess(null), 5000);
    }, 500);
  }

  function assertWhatsAppPhone(phone: string) {
    if (isValidWhatsAppNumber(phone)) return true;
    setError("Invalid phone number for WhatsApp");
    return false;
  }

  return { loading, saving, sendingEmail, error, notice, order, form, setForm, save, sendConfirmationEmail, sendingWhatsApp, whatsAppSuccess, openCustomerWhatsApp, sendOrderConfirmation };
}
