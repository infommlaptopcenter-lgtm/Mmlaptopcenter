"use client";

import { OrdersTable } from "./_components/orders-table";
import { useOrders } from "./_components/use-orders";

export default function OrdersPage() {
  const { orders, loading } = useOrders();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-[#0a0a0a] mb-4 md:mb-6">Orders</h1>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
