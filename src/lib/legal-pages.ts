import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";

export type LegalPageSlug = "faq" | "privacy" | "terms" | "refund-policy";

export type LegalSection = { id: string; title: string; body: string };
export type FaqItem = { id: string; question: string; answer: string };

export type LegalPageData = {
  slug: LegalPageSlug;
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  lastUpdated: string;
  heroImage: string;
  sections: LegalSection[];
  faqs?: FaqItem[];
};

const clean = (value: string) => sanitizeHtml(value, {
  allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "a"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
});

export const legalPageDefaults: Record<LegalPageSlug, LegalPageData> = {
  faq: {
    slug: "faq", eyebrow: "Help centre", title: "Questions, answered with", titleHighlight: "clarity.",
    description: "Straightforward answers about our laptops, device checks, delivery, warranty support, and buying process.",
    lastUpdated: "July 2026", heroImage: "/logo/new logo.png", sections: [],
    faqs: [
      { id: "products", question: "What types of laptops do you sell?", answer: "We stock Apple MacBooks, business laptops, gaming laptops, and premium accessories from trusted brands including Dell, HP, Lenovo, ASUS, and Apple." },
      { id: "testing", question: "Are your devices tested before sale?", answer: "Yes. Each laptop is inspected for battery health, keyboard responsiveness, display quality, ports, charging performance, and general usability before listing." },
      { id: "warranty", question: "Do you offer warranty support?", answer: "Eligible products include warranty-backed support. The exact warranty period and coverage are shown with the product or confirmed before purchase." },
      { id: "used", question: "Can I buy a used or refurbished laptop?", answer: "Yes. Our pre-owned and refurbished devices are cleaned, inspected, tested, and described transparently so you can make an informed choice." },
      { id: "delivery", question: "Do you deliver across Pakistan?", answer: "Yes. We arrange delivery across Pakistan. Delivery time and charges can vary by destination, product, and courier availability." },
      { id: "guidance", question: "Can you help me choose the right laptop?", answer: "Absolutely. Tell us your work, study, creative, or gaming needs and your budget, and our team will recommend suitable options without unnecessary upselling." },
      { id: "accessories", question: "Do you sell accessories?", answer: "Yes. We stock chargers, laptop bags, mice, keyboards, USB-C hubs, storage, memory, and other useful accessories." },
      { id: "support", question: "How can I contact support after purchase?", answer: "Use our contact page, call the store, or message our support team. Keep your order details available so we can help quickly." },
    ],
  },
  privacy: {
    slug: "privacy", eyebrow: "Your data, respected", title: "Privacy built on", titleHighlight: "trust.",
    description: "A clear explanation of what information we collect, why we use it, and how we work to protect it.",
    lastUpdated: "July 2026", heroImage: "/logo/new logo.png",
    sections: [
      { id: "information", title: "Information we collect", body: "<p>We may collect your name, phone number, email, delivery address, order details, support messages, and payment confirmation information when you shop or contact us. We do not ask you to send card passwords or banking PINs.</p>" },
      { id: "use", title: "How we use your information", body: "<p>We use your information to process and deliver orders, provide customer support, confirm payments, prevent misuse, improve our store, and send service updates related to your purchase.</p>" },
      { id: "sharing", title: "When information is shared", body: "<p>We share only the information reasonably required by trusted service providers such as couriers, payment partners, hosting providers, and professional advisers. We do not sell your personal information.</p>" },
      { id: "security", title: "Security and retention", body: "<p>We use reasonable administrative and technical safeguards to protect customer data. Information is retained only as long as needed for orders, support, legal obligations, fraud prevention, and legitimate business records.</p>" },
      { id: "choices", title: "Your choices", body: "<p>You may ask us to correct or delete eligible personal information, or opt out of promotional communication. Some order records may need to be retained for legal or accounting purposes.</p>" },
      { id: "contact", title: "Privacy questions", body: "<p>For a privacy request, contact us at <a href=\"mailto:info.mmlaptopcenter@gmail.com\">info.mmlaptopcenter@gmail.com</a> and include enough information for us to identify and respond to your request.</p>" },
    ],
  },
  terms: {
    slug: "terms", eyebrow: "Fair shopping terms", title: "Clear terms. Better", titleHighlight: "confidence.",
    description: "The practical rules that apply when you browse, order, pay for, or receive products from MM Laptop Center.",
    lastUpdated: "July 2026", heroImage: "/logo/new logo.png",
    sections: [
      { id: "agreement", title: "Agreement to these terms", body: "<p>By using this website or placing an order, you agree to these terms. If you do not agree, please do not use the store or submit an order.</p>" },
      { id: "products", title: "Products and descriptions", body: "<p>We aim to describe each product, its condition, specifications, included accessories, and availability accurately. Minor colour differences may occur between screens, and pre-owned items may show the disclosed signs of use.</p>" },
      { id: "orders", title: "Orders, prices, and payment", body: "<p>An order is confirmed only after we accept it and any required payment is verified. Prices and stock can change before confirmation. If an obvious pricing or availability error occurs, we may cancel the affected order and return any amount received.</p>" },
      { id: "delivery", title: "Delivery and inspection", body: "<p>Delivery estimates are provided in good faith but can be affected by couriers, weather, public holidays, and destination. Please inspect the parcel promptly and report visible damage or a material issue as soon as possible.</p>" },
      { id: "warranty", title: "Warranty and support", body: "<p>Warranty coverage varies by product and is communicated on the listing, invoice, or at purchase. Damage caused by misuse, liquid, unauthorised repair, electrical faults, or normal wear may not be covered.</p>" },
      { id: "responsibility", title: "Responsible website use", body: "<p>You may not misuse the website, attempt unauthorised access, submit false orders, copy protected content for commercial use, or interfere with other customers.</p>" },
      { id: "changes", title: "Updates and contact", body: "<p>We may update these terms when our services or requirements change. The latest version shown here applies from its stated update date. Contact our team before ordering if any term is unclear.</p>" },
    ],
  },
  "refund-policy": {
    slug: "refund-policy", eyebrow: "Returns & resolution", title: "A fair path to make things", titleHighlight: "right.",
    description: "Understand the steps, timeframes, and checks involved when a product needs to be returned or reviewed.",
    lastUpdated: "July 2026", heroImage: "/logo/new logo.png",
    sections: [
      { id: "window", title: "Contact us within 7 days", body: "<p>If you believe an item is defective, damaged, materially different from its description, or not the item ordered, contact us within 7 days of delivery. Share your order details and clear photos or video of the issue.</p>" },
      { id: "eligibility", title: "Return eligibility", body: "<p>Eligible items should be returned in the condition received with serial labels, included accessories, packaging, and proof of purchase. Do not remove seals or attempt a repair before our team reviews the issue.</p>" },
      { id: "exceptions", title: "Items that may not qualify", body: "<p>A return may not be accepted for change of mind, disclosed cosmetic condition, accidental or liquid damage, software issues caused after delivery, missing parts, unauthorised repair, or normal battery wear that was accurately described.</p>" },
      { id: "assessment", title: "Assessment and resolution", body: "<p>After receiving the item, we inspect it and verify the reported issue. Depending on the circumstances and applicable warranty, we may offer troubleshooting, repair, replacement, store credit, or a refund.</p>" },
      { id: "refunds", title: "Approved refunds", body: "<p>Approved refunds are sent through an agreed available method after inspection. Processing time can vary by bank or payment service. Original delivery charges may be non-refundable unless the order was incorrect or arrived with a verified issue.</p>" },
      { id: "start", title: "Start a return request", body: "<p>Contact our team before sending anything back. We will confirm the return address and safe packing instructions. Unauthorised parcels may be delayed or refused.</p>" },
    ],
  },
};

function normalize(slug: LegalPageSlug, value: Partial<LegalPageData>): LegalPageData {
  const fallback = legalPageDefaults[slug];
  const sections = Array.isArray(value.sections) ? value.sections : fallback.sections;
  const faqs = Array.isArray(value.faqs) ? value.faqs : fallback.faqs;
  return {
    ...fallback, ...value, slug,
    sections: sections.map((section, index) => ({ id: section.id || `section-${index}`, title: section.title || "Untitled section", body: clean(section.body || "") })),
    faqs: faqs?.map((item, index) => ({ id: item.id || `faq-${index}`, question: item.question || "Question", answer: clean(item.answer || "") })),
  };
}

export async function getLegalPage(slug: LegalPageSlug): Promise<LegalPageData> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: `legalPage:${slug}` }, select: { value: true } });
    if (setting?.value) return normalize(slug, setting.value as Partial<LegalPageData>);

    const legacyKey = slug === "privacy" ? "privacyPolicy" : slug === "terms" ? "termsOfService" : slug === "refund-policy" ? "refundPolicy" : null;
    if (legacyKey) {
      const legacy = await prisma.siteSetting.findUnique({ where: { key: legacyKey }, select: { value: true } });
      const value = legacy?.value as { title?: string; body?: string } | undefined;
      if (value?.body) return normalize(slug, { title: value.title || legalPageDefaults[slug].title, sections: [{ id: "policy", title: "Policy details", body: value.body }] });
    }
  } catch (error) {
    console.error(`Unable to load legal page ${slug}; using defaults.`, error);
  }
  return legalPageDefaults[slug];
}
