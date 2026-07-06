export type OrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: number;
  orderStatus: string;
  createdAt: string;
};

export type OrderDetail = OrderListItem & {
  customerAddress: any;
  items: any;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};
