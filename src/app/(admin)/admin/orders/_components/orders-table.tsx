import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { isValidWhatsAppNumber } from "@/lib/whatsapp";
import { statusColors } from "./status-colors";
import type { OrderListItem } from "./types";

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  return (
    <div className="-mx-4 overflow-hidden rounded-lg bg-white shadow md:mx-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              {["Order #", "Customer", "Contact", "Status", "Total", "Date", "Actions"].map((label) => (
                <th key={label} className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500 md:px-4 md:py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => <OrderRow key={order.id} order={order} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: OrderListItem }) {
  const hasWhatsApp = order.customerPhone && isValidWhatsAppNumber(order.customerPhone);
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 py-2 text-sm font-medium md:px-4 md:py-3">{order.orderNumber}</td>
      <td className="px-2 py-2 text-xs md:px-4 md:py-3 md:text-sm">{order.customerName}</td>
      <td className="px-2 py-2 text-xs md:px-4 md:py-3 md:text-sm">
        <div className="flex items-center gap-2">{order.customerPhone ? <><span className="max-w-[120px] truncate">{order.customerPhone}</span>{hasWhatsApp && <span className="flex-shrink-0 text-[#25D366]" title="WhatsApp available"><FaWhatsapp className="h-4 w-4" /></span>}</> : <span className="text-xs text-gray-400">No phone</span>}</div>
      </td>
      <td className="px-2 py-2 md:px-4 md:py-3"><span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>{order.orderStatus}</span></td>
      <td className="px-2 py-2 text-right text-xs font-medium md:px-4 md:py-3 md:text-sm">Rs. {order.total.toLocaleString()}</td>
      <td className="px-2 py-2 text-right text-xs text-gray-500 md:px-4 md:py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="px-2 py-2 text-right md:px-4 md:py-3">
        <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs text-[#d8a928] hover:underline md:text-sm">
          <FiEye className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">View</span>
        </Link>
      </td>
    </tr>
  );
}
