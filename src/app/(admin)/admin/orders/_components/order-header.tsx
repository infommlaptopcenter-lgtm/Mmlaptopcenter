import Link from "next/link";
import type { OrderDetail } from "./types";

export function OrderHeader({ order }: { order: OrderDetail }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-[#d8a928]/20 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#c86f2d]">Order workspace</p><div className="mt-1 flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-[#0a0a0a]">{order.orderNumber}</h1><span className="rounded-full bg-[#fcf5e8] px-2.5 py-1 text-xs font-bold capitalize text-[#c86f2d]">{order.orderStatus}</span></div>
        <p className="mt-1 text-sm text-[#5A5E55]">Placed {new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <Link href="/admin/orders" className="rounded-lg border border-[#d8a928]/25 bg-white px-3 py-2 text-xs font-bold text-[#0a0a0a] hover:bg-[#fcf5e8] sm:text-sm">
        Back to orders
      </Link>
    </div>
  );
}
