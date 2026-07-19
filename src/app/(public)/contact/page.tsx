import ContactClient from "./contact-client";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Contact Laptop Shop Charsadda",
  description: "Contact MM Laptop Center Charsadda for MacBooks, gaming laptops, business laptops, accessories, upgrades and delivery across Pakistan.",
  path: "/contact",
  keywords: ["Laptop Shop Charsadda", "Laptop Shop KPK", "MM Laptop Center contact"],
});

export default function ContactPage() {
  return <ContactClient />;
}

