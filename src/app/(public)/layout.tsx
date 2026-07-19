import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatIntegrations } from "@/components/integrations/chat-integrations";
import { SiteLoader } from "@/components/core/site-loader";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";

const businessSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "MM Laptop Center",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/mmlaptop.png`,
    sameAs: ["https://www.facebook.com/mmlaptopcenter", "https://www.instagram.com/mmlaptopcenter"],
  },
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ComputerStore"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: "MM Laptop Center",
    url: SITE_URL,
    image: `${SITE_URL}/logo/mmlaptop.png`,
    priceRange: "PKR",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Charsadda",
      addressRegion: "Khyber Pakhtunkhwa",
      addressCountry: "PK",
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-site flex min-h-screen flex-col">
      <JsonLd data={businessSchemas} />
      <Header />
      <SiteLoader />
      <main className="flex-grow bg-[#f5f5f5] pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <ChatIntegrations />
    </div>
  );
}

