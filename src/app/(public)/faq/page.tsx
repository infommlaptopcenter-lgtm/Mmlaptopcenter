import { FaqList } from "./_components/faq-list";
import { LegalPageShell } from "../_components/legal-page-shell";
import { getLegalPage } from "@/lib/legal-pages";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Laptop Buying FAQ Pakistan",
  description: "Answers about buying laptops in Pakistan, delivery, tested MacBooks, gaming laptops, accessories, warranty and support from MM Laptop Center Charsadda.",
  path: "/faq",
  keywords: ["Laptop FAQ Pakistan", "Buy Laptop Pakistan", "Laptop warranty Pakistan"],
});

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const page = await getLegalPage("faq");
  const faqItems = page.faqs ?? [];
  return (
    <>
      <JsonLd data={[
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        },
      ]} />
      <LegalPageShell page={page}><FaqList items={faqItems} /></LegalPageShell>
    </>
  );
}

