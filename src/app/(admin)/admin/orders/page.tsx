"use client";

import { OrdersTable } from "./_components/orders-table";
import { useOrders } from "./_components/use-orders";

export default function OrdersPage() {
  const state = useOrders();
  return <div className="p-4 md:p-8">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c86f2d]">Sales management</p><h1 className="mt-1 text-2xl font-extrabold text-[#0a0a0a]">Orders</h1><p className="mt-1 text-sm text-gray-500">Review customers, payments, fulfillment and communication.</p></div>
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Visible orders" value={state.orders.length} /><Stat label="Needs action" value={state.orders.filter((order) => order.orderStatus === "pending").length} /><Stat label="Processing" value={state.orders.filter((order) => ["confirmed", "processing"].includes(order.orderStatus)).length} /><Stat label="Revenue" value={`PKR ${state.orders.filter((order) => order.orderStatus !== "cancelled").reduce((sum, order) => sum + order.total, 0).toLocaleString()}`} /></div>
    <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
      <label className="text-xs font-semibold text-gray-600">Search<input value={state.search} onChange={(event) => state.setSearch(event.target.value)} placeholder="Order, customer, email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
      <Filter label="Order status" value={state.status} setValue={state.setStatus} options={["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]} />
      <Filter label="Payment status" value={state.paymentStatus} setValue={state.setPaymentStatus} options={["pending", "verified", "failed", "refunded"]} />
    </div>
    {state.loading ? <p className="text-sm text-gray-500">Loading...</p> : state.error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : state.orders.length === 0 ? <p className="text-sm text-gray-500">No matching orders</p> : <OrdersTable orders={state.orders} />}
  </div>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-[#d8a928]/20 bg-white p-3 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p><p className="mt-1 text-lg font-extrabold text-[#c86f2d]">{value}</p></div>;
}

function Filter({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) {
  return <label className="text-xs font-semibold text-gray-600">{label}<select value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="">All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
