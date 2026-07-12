"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderCustomerPanel } from "../_components/order-customer-panel";
import { OrderHeader } from "../_components/order-header";
import { OrderItemsPanel } from "../_components/order-items-panel";
import { OrderStatusPanel } from "../_components/order-status-panel";
import { useOrderDetail } from "../_components/use-order-detail";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const state = useOrderDetail(params?.id);

  if (state.loading) return <div className="p-8 text-sm text-[#5A5E55]">Loading...</div>;
  if (state.error) return <ErrorView error={state.error} />;
  if (!state.order) return null;

  return (
    <div className="p-8">
      <OrderHeader order={state.order} />
      {state.whatsAppSuccess && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{state.whatsAppSuccess}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2"><OrderItemsPanel order={state.order} /></div>
        <div className="space-y-6">
          <OrderCustomerPanel order={state.order} sendingWhatsApp={state.sendingWhatsApp} openCustomerWhatsApp={state.openCustomerWhatsApp} sendOrderConfirmation={state.sendOrderConfirmation} />
          <OrderStatusPanel form={state.form} setForm={state.setForm} saving={state.saving} save={state.save} paymentMethod={state.order.paymentMethod} paymentProofUrl={state.order.paymentProofUrl} transactionReference={state.order.transactionReference} />
        </div>
      </div>
    </div>
  );
}

function ErrorView({ error }: { error: string }) {
  return (
    <div className="p-8">
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      <Link href="/admin/orders" className="text-sm font-semibold text-[#f6a45d] hover:underline">Back to orders</Link>
    </div>
  );
}
