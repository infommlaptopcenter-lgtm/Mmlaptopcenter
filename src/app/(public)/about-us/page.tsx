import { Metadata } from "next"
import { AboutPageContent } from "./_components/about-page-content"

export const metadata: Metadata = {
  title: "Our Story - 20+ Years of Trust | MM Laptop Center",
  description:
    "Founded by Mudassir Meer, MM Laptop Center has supplied authentic MacBooks, gaming laptops, and premium tech accessories to Pakistan for over 20 years.",
  keywords: [
    "about MM Laptop Center",
    "Mudassir Meer",
    "genuine MacBooks Pakistan",
    "laptop shop Lahore",
    "gaming laptops",
    "premium tech accessories",
  ],
  openGraph: {
    title: "About Mudassir Meer's MM Laptop Center | 20+ Years of Tech Legacy",
    description:
      "From a single workbench to Pakistan's trusted tech destination. Learn about Mudassir Meer's vision for authentic laptops and gear.",
    type: "website",
  },
  alternates: {
    canonical: "https://mmlaptopcenter.com/about-us",
  },
}

export default function AboutPage() {
  return <AboutPageContent />;
}


