"use client";

import Link from "next/link";
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { statusColors } from "./status-colors";
import type { OrderListItem } from "./types";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];

export function OrdersTable({ orders, onChanged }: { orders: OrderListItem[]; onChanged: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function changeStatus(order: OrderListItem, orderStatus: string) {
    setBusyId(order.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update order status");
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update order status");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteOrder(order: OrderListItem) {
    if (!window.confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    setBusyId(order.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete order");
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete order");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error ? <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-3 md:hidden">
        {orders.map((order) => <MobileOrder key={order.id} order={order} busy={busyId === order.id} changeStatus={changeStatus} deleteOrder={deleteOrder} />)}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {['Order', 'Customer', 'Payment', 'Total', 'Date', 'Status', 'Actions'].map((label) => <th key={label} className="px-4 pb-1">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => <OrderRow key={order.id} order={order} busy={busyId === order.id} changeStatus={changeStatus} deleteOrder={deleteOrder} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}

type RowProps = {
  order: OrderListItem;
  busy: boolean;
  changeStatus: (order: OrderListItem, status: string) => Promise<void>;
  deleteOrder: (order: OrderListItem) => Promise<void>;
};

function OrderRow({ order, busy, changeStatus, deleteOrder }: RowProps) {
  return (
    <tr className="bg-white text-sm shadow-[0_8px_24px_rgba(30,31,28,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(30,31,28,0.13)]">
      <td className="rounded-l-2xl border-y border-l border-gray-100 px-4 py-4 font-bold text-gray-900">{order.orderNumber}</td>
      <td className="border-y border-gray-100 px-4 py-4"><p className="font-semibold text-gray-900">{order.customerName}</p><p className="mt-0.5 max-w-44 truncate text-xs text-gray-400">{order.customerPhone || order.customerEmail || "No contact"}</p></td>
      <td className="border-y border-gray-100 px-4 py-4"><p className="capitalize text-gray-800">{order.paymentMethod.replaceAll("_", " ")}</p><p className="mt-0.5 text-xs capitalize text-gray-400">{order.paymentStatus}</p></td>
      <td className="border-y border-gray-100 px-4 py-4 font-bold text-gray-900">PKR {order.total.toLocaleString()}</td>
      <td className="border-y border-gray-100 px-4 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="border-y border-gray-100 px-4 py-4"><StatusSelect order={order} busy={busy} changeStatus={changeStatus} /></td>
      <td className="rounded-r-2xl border-y border-r border-gray-100 px-4 py-4"><Actions order={order} busy={busy} deleteOrder={deleteOrder} /></td>
    </tr>
  );
}

function MobileOrder({ order, busy, changeStatus, deleteOrder }: RowProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_rgba(30,31,28,0.09)]">
      <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-gray-900">{order.orderNumber}</p><p className="mt-1 text-sm text-gray-600">{order.customerName}</p></div><strong className="text-sm text-gray-900">PKR {order.total.toLocaleString()}</strong></div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3"><StatusSelect order={order} busy={busy} changeStatus={changeStatus} /><Actions order={order} busy={busy} deleteOrder={deleteOrder} /></div>
    </article>
  );
}

function StatusSelect({ order, busy, changeStatus }: Pick<RowProps, "order" | "busy" | "changeStatus">) {
  return <select value={order.orderStatus} disabled={busy} onChange={(event) => void changeStatus(order, event.target.value)} className={`rounded-lg border-0 px-3 py-2 text-xs font-bold capitalize outline-none ring-1 ring-black/5 disabled:opacity-50 ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>;
}

function Actions({ order, busy, deleteOrder }: Pick<RowProps, "order" | "busy" | "deleteOrder">) {
  return <div className="flex items-center justify-end gap-2"><Link href={`/admin/orders/${order.id}`} aria-label={`Edit ${order.orderNumber}`} className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-[#c86f2d] transition hover:bg-amber-100"><FiEdit2 /></Link><button type="button" disabled={busy} onClick={() => void deleteOrder(order)} aria-label={`Delete ${order.orderNumber}`} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"><FiTrash2 /></button></div>;
}
