import { FaqPageContent } from "./_components/faq-page-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Laptop Buying FAQ Pakistan",
  description: "Answers about buying laptops in Pakistan, delivery, tested MacBooks, gaming laptops, accessories, warranty and support from MM Laptop Center Charsadda.",
  path: "/faq",
  keywords: ["Laptop FAQ Pakistan", "Buy Laptop Pakistan", "Laptop warranty Pakistan"],
});

const faqItems = [
  ["What types of laptops do you sell?", "We stock Apple MacBooks, business laptops, gaming laptops, and premium accessories from trusted brands such as Dell, HP, Lenovo, ASUS, and Apple."],
  ["Are your devices tested before sale?", "Yes. Each laptop is inspected for battery health, keyboard responsiveness, display quality, ports, and charging performance before listing."],
  ["Do you offer warranty support?", "We provide warranty-backed support for eligible products and help with after-sales questions related to setup, repairs, and replacement concerns."],
  ["Do you deliver across Pakistan?", "Yes. We ship to customers across Pakistan and also assist with pickup and delivery coordination where available."],
  ["Do you sell accessories too?", "Yes. We stock chargers, laptop bags, mice, keyboards, USB-C hubs, storage, memory, and other laptop accessories."],
];

export default function FAQPage() {
  return (
    <>
      <JsonLd data={[
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        },
      ]} />
      <FaqPageContent />
    </>
  );
}

