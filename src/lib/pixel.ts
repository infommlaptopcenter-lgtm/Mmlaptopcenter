export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
export const META_CURRENCY = "PKR" as const;

export type MetaContent = {
  id: string;
  quantity: number;
  item_price: number;
  variant?: string;
};

export type MetaUserData = {
  em?: string; // Email
  ph?: string; // Phone number
  fn?: string; // First name
  ln?: string; // Last name
  ct?: string; // City
  st?: string; // State / Province
  zp?: string; // Zip / Postal Code
  country?: string; // Two-letter country code
  external_id?: string; // Unique external ID (e.g. order number)
};

export type MetaEventParameters = {
  content_ids?: string[];
  contents?: MetaContent[];
  content_name?: string;
  content_category?: string;
  content_type?: "product";
  value?: number;
  currency?: typeof META_CURRENCY;
  num_items?: number;
  order_id?: string;
  search_string?: string;
  contact_method?: string;
};

type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Contact"
  | "Lead";

type MetaPixelFunction = {
  (command: "track", event: MetaStandardEvent, parameters?: MetaEventParameters): void;
  (command: "init", pixelId: string, userData?: Record<string, string>): void;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
  }
}

/**
 * Normalizes a phone number for Meta Advanced Matching.
 * Handles Pakistani mobile prefixes (e.g. 03xx -> 923xx) and standardizes to digits-only.
 */
export function normalizePhoneForMeta(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("03") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  if (digits.startsWith("3") && digits.length === 10) {
    return `92${digits}`;
  }
  return digits;
}

/**
 * Splits a full name string into first and last name parts for Meta Advanced Matching.
 */
export function extractNameParts(fullName?: string): { fn?: string; ln?: string } {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { fn: parts[0].toLowerCase() };
  return {
    fn: parts[0].toLowerCase(),
    ln: parts.slice(1).join(" ").toLowerCase(),
  };
}

/**
 * Normalizes user data fields according to Meta's Advanced Matching requirements.
 * Meta's client-side fbevents.js script automatically hashes these values using SHA-256 before transmission.
 */
export function normalizeUserData(data?: MetaUserData): Record<string, string> | undefined {
  if (!data) return undefined;
  const clean: Record<string, string> = {};

  if (data.em && data.em.trim()) {
    clean.em = data.em.trim().toLowerCase();
  }
  if (data.ph) {
    const normPhone = normalizePhoneForMeta(data.ph);
    if (normPhone) clean.ph = normPhone;
  }
  if (data.fn && data.fn.trim()) {
    clean.fn = data.fn.trim().toLowerCase();
  }
  if (data.ln && data.ln.trim()) {
    clean.ln = data.ln.trim().toLowerCase();
  }
  if (data.ct && data.ct.trim()) {
    clean.ct = data.ct.trim().toLowerCase();
  }
  if (data.st && data.st.trim()) {
    clean.st = data.st.trim().toLowerCase();
  }
  if (data.zp && data.zp.trim()) {
    clean.zp = data.zp.trim().toLowerCase();
  }
  if (data.country && data.country.trim()) {
    clean.country = data.country.trim().toLowerCase();
  }
  if (data.external_id && data.external_id.trim()) {
    clean.external_id = data.external_id.trim();
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

/**
 * Updates Meta Pixel user matching data dynamically when customer inputs become available.
 */
export function setUserMatching(userData?: MetaUserData): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function" || !META_PIXEL_ID) return;
  const normalized = normalizeUserData(userData);
  if (!normalized) return;
  try {
    window.fbq("init", META_PIXEL_ID, normalized);
  } catch {
    // Tracking must never interrupt checkout or browsing.
  }
}

function track(event: MetaStandardEvent, parameters?: MetaEventParameters): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  try {
    window.fbq("track", event, parameters);
  } catch {
    // Tracking must never interrupt shopping when Meta is blocked or unavailable.
  }
}

export const pageView = (): void => track("PageView");
export const viewContent = (parameters: MetaEventParameters): void =>
  track("ViewContent", parameters);
export const search = (searchString: string): void =>
  track("Search", { search_string: searchString });
export const addToCart = (parameters: MetaEventParameters): void =>
  track("AddToCart", parameters);
export const initiateCheckout = (
  parameters: MetaEventParameters,
  userData?: MetaUserData,
): void => {
  if (userData) setUserMatching(userData);
  track("InitiateCheckout", parameters);
};
export const addPaymentInfo = (
  parameters: MetaEventParameters,
  userData?: MetaUserData,
): void => {
  if (userData) setUserMatching(userData);
  track("AddPaymentInfo", parameters);
};
export const purchase = (
  parameters: MetaEventParameters,
  userData?: MetaUserData,
): void => {
  if (userData) setUserMatching(userData);
  track("Purchase", parameters);
};
export const contact = (contactMethod = "WhatsApp"): void =>
  track("Contact", { contact_method: contactMethod });
export const lead = (
  contactMethod = "contact_form",
  userData?: MetaUserData,
): void => {
  if (userData) setUserMatching(userData);
  track("Lead", { contact_method: contactMethod });
};


