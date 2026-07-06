export const FB_PIXEL_ID = "1520641896287637";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Track PageView event
 * Automatically tracked via layout.tsx, but can be called manually if needed
 */
export const pageview = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
};

/**
 * Track ViewContent event
 * Fire when a user views a product page
 */
export const viewContent = (
  productName: string,
  productId: string,
  price: number,
): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: productName,
      content_ids: [productId],
      content_type: "product",
      value: price,
      currency: "PKR",
    });
  }
};

/**
 * Track AddToCart event
 * Fire when a user adds an item to cart
 */
export const addToCart = (
  productName: string,
  productId: string,
  price: number,
): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: productName,
      content_ids: [productId],
      content_type: "product",
      value: price,
      currency: "PKR",
    });
  }
};

/**
 * Track ViewCart event
 * Fire when a user views their cart
 */
export const viewCart = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "ViewCart");
  }
};

/**
 * Track InitiateCheckout event
 * Fire when a user starts the checkout process
 */
export const initiateCheckout = (totalPrice: number): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      value: totalPrice,
      currency: "PKR",
    });
  }
};

/**
 * Track AddPaymentInfo event
 * Fire when a user enters payment information
 */
export const addPaymentInfo = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "AddPaymentInfo");
  }
};

/**
 * Track Purchase event
 * Fire when a user completes a purchase
 */
export const purchase = (orderId: string, totalPrice: number): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Purchase", {
      content_ids: [orderId],
      content_type: "product",
      value: totalPrice,
      currency: "PKR",
    });
  }
};

/**
 * Track Search event
 * Fire when a user performs a search
 */
export const search = (searchTerm: string): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Search", {
      search_string: searchTerm,
    });
  }
};

/**
 * Track AddToWishlist event
 * Fire when a user adds an item to wishlist
 */
export const addToWishlist = (
  productName: string,
  productId: string,
  price: number,
): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "AddToWishlist", {
      content_name: productName,
      content_ids: [productId],
      value: price,
      currency: "PKR",
    });
  }
};

/**
 * Track CompleteRegistration event
 * Fire when a user completes registration
 */
export const completeRegistration = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "CompleteRegistration");
  }
};

/**
 * Track Lead event
 * Fire when a user submits a lead form (contact, bulk order, etc.)
 */
export const lead = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead");
  }
};
