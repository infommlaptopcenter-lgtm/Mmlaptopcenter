export const DELIVERY_CHARGE = 400;
export const COD_TAX_RATE = 0.04;

export function calculateOrderPricing(subtotal: number, isCashOnDelivery: boolean) {
  const shippingCost = DELIVERY_CHARGE;
  const tax = isCashOnDelivery ? Math.round(subtotal * COD_TAX_RATE) : 0;

  return {
    shippingCost,
    tax,
    total: subtotal + shippingCost + tax,
  };
}
