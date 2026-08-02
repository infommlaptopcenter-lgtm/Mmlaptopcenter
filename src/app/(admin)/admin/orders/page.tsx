"use client";

import type { IconType } from "react-icons";
import { FiCheckCircle, FiClock, FiDollarSign, FiPackage, FiTruck } from "react-icons/fi";
import { OrdersTable } from "./_components/orders-table";
import { useOrders } from "./_components/use-orders";

export default function OrdersPage() {
  const state = useOrders();
  const metrics = getMetrics(state.orders);

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c86f2d]">Sales management</p><h1 className="mt-1 text-2xl font-black tracking-tight text-[#171816] sm:text-3xl">Orders</h1><p className="mt-1 text-sm text-gray-500">Track payments, fulfillment, delivery, and customer updates.</p></div>
          <button type="button" onClick={() => void state.fetchOrders()} disabled={state.loading} className="self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#f6a45d] hover:text-[#c86f2d] disabled:opacity-50 sm:self-auto">{state.loading ? "Refreshing..." : "Refresh orders"}</button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard label="Total orders" value={metrics.total} detail="Available records" icon={FiPackage} tone="blue" />
          <MetricCard label="Needs action" value={metrics.pending} detail="Pending review" icon={FiClock} tone="orange" />
          <MetricCard label="In progress" value={metrics.inProgress} detail="Confirmed or processing" icon={FiTruck} tone="yellow" />
          <MetricCard label="Completed" value={metrics.completed} detail="Shipped or completed" icon={FiCheckCircle} tone="green" />
          <MetricCard label="Active revenue" value={`PKR ${metrics.revenue.toLocaleString()}`} detail="Excludes cancelled" icon={FiDollarSign} tone="dark" wide />
        </section>

        <section className="mb-5 rounded-2xl border border-white bg-white p-3 shadow-[0_8px_30px_rgba(30,31,28,0.06)] sm:p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-bold text-gray-600">Search orders<input value={state.search} onChange={(event) => state.setSearch(event.target.value)} placeholder="Order, customer or email" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#f6a45d] focus:bg-white focus:ring-2 focus:ring-orange-100" /></label>
            <Filter label="Order status" value={state.status} setValue={state.setStatus} options={["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]} />
            <Filter label="Payment status" value={state.paymentStatus} setValue={state.setPaymentStatus} options={["pending", "verified", "failed", "refunded"]} />
          </div>
          {(state.search || state.status || state.paymentStatus) ? <button type="button" onClick={() => { state.setSearch(""); state.setStatus(""); state.setPaymentStatus(""); }} className="mt-3 text-xs font-bold text-[#c86f2d] hover:underline">Clear all filters</button> : null}
        </section>

        {state.loading && state.orders.length === 0 ? <LoadingRows /> : state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p className="font-bold">Orders could not be loaded</p><p className="mt-1">{state.error}</p><button onClick={() => void state.fetchOrders()} className="mt-3 font-bold underline">Try again</button></div> : state.orders.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><FiPackage className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 font-bold text-gray-700">No matching orders</p><p className="mt-1 text-sm text-gray-400">Change or clear the filters to see more results.</p></div> : <OrdersTable orders={state.orders} onChanged={state.fetchOrders} />}
      </div>
    </main>
  );
}

const tones = {
  blue: "border-blue-100 bg-gradient-to-br from-blue-50 to-white text-blue-600",
  orange: "border-orange-100 bg-gradient-to-br from-orange-50 to-white text-orange-600",
  yellow: "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-600",
  green: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-600",
  dark: "border-gray-800 bg-gradient-to-br from-[#272825] to-[#111210] text-white",
};

function MetricCard({ label, value, detail, icon: Icon, tone, wide = false }: { label: string; value: string | number; detail: string; icon: IconType; tone: keyof typeof tones; wide?: boolean }) {
  return <article className={`relative min-h-32 overflow-hidden rounded-2xl border p-4 shadow-[0_8px_24px_rgba(30,31,28,0.06)] sm:p-5 ${tones[tone]} ${wide ? "col-span-2 lg:col-span-1" : ""}`}><div className="flex items-start justify-between gap-2"><p className={`text-xs font-bold ${tone === "dark" ? "text-gray-300" : "text-gray-600"}`}>{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone === "dark" ? "bg-white/10" : "bg-white shadow-sm"}`}><Icon className="h-4 w-4" /></span></div><p className="mt-3 truncate text-2xl font-black tracking-tight sm:text-3xl">{value}</p><p className={`mt-1 text-[11px] ${tone === "dark" ? "text-gray-400" : "text-gray-400"}`}>{detail}</p></article>;
}

function Filter({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) {
  return <label className="text-xs font-bold text-gray-600">{label}<select value={value} onChange={(event) => setValue(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm capitalize outline-none transition focus:border-[#f6a45d] focus:bg-white focus:ring-2 focus:ring-orange-100"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function getMetrics(orders: Array<{ orderStatus: string; total: number }>) {
  return { total: orders.length, pending: orders.filter((order) => order.orderStatus === "pending").length, inProgress: orders.filter((order) => ["confirmed", "processing"].includes(order.orderStatus)).length, completed: orders.filter((order) => ["shipped", "completed"].includes(order.orderStatus)).length, revenue: orders.filter((order) => order.orderStatus !== "cancelled").reduce((sum, order) => sum + order.total, 0) };
}

function LoadingRows() {
  return <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>;
}
