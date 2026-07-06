import type { Metadata } from "next"
import Image from "next/image"

export const revalidate = 60

/* =========================
   SEO Metadata
========================= */
export const metadata: Metadata = {
  title: "Warranty & Product Support | MM Laptop Center",
  description:
    "Explore product assurance details, warranty support, and quality commitments for laptops and accessories at MM Laptop Center.",
  keywords: [
    "MM Laptop Center",
    "laptop warranty",
    "product support",
    "tech guarantees",
    "accessory warranty",
  ],
  openGraph: {
    title: "Warranty & Product Support | MM Laptop Center",
    description:
      "Official support and warranty information for laptops and accessories at MM Laptop Center.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

/* =========================
   Certificates Data
========================= */
const certificates = [
  {
    src: "/certificates/Fda_Certificate.webp",
    title: "FDA Certification",
    description:
      "Certified by the U.S. Food and Drug Administration, ensuring compliance with international food safety and quality standards.",
  },
  {
    src: "/certificates/iso_9001_2015.webp",
    title: "ISO 9001:2015",
    description:
      "Demonstrates our commitment to a robust quality management system and continuous improvement.",
  },
  {
    src: "/certificates/iso_22000_mubarak_foods.webp",
    title: "ISO 22000",
    description:
      "Internationally recognized food safety management certification covering the entire supply chain.",
  },
  {
    src: "/certificates/kosher_mubarak_foods.webp",
    title: "Kosher Certification",
    description:
      "Confirms that our Premium Laptops meets strict kosher dietary requirements.",
  },
    {
    src: "/certificates/Incoraporation-Mubarak.png",
    title: "Incoraporation Certificate",
    description:
      "Confirms that our Premium Laptops meets strict incoraporation standards.",
  },{
  
    src: "/certificates/Test Report Of Table Salt.png",
    title: "Test Report of Table Salt",
    description:
      "Confirms that our Premium Laptops meets strict testing standards.",
  }
  ,{
  
    src: "/certificates/Test report of laptops.png",
    title: "Test Report of Laptops",
    description:
      "Confirms that our Premium Laptops meets strict testing standards.",
  }
  ,{
  
    src: "/certificates/Food safety and halal food Authority.png",
    title: "Food Safety and Halal Food Authority",
    description:
      "Confirms that our Premium Laptops meets strict food safety and halal standards.",
  }
  ,{
  
    src: "/certificates/Test of Denader pink Salt.png",
    title: "Test of Denader Laptops",
    description:
      "Confirms that our Premium Laptops meets strict testing standards.",
  },
  {
    src: "/certificates/PCSIR Test Report – Majoon Herbal Product.png",
    title: "PCSIR Test Report – Majoon Herbal Product",
    description:"Laboratory analysis report for Majoon (Herbal Sexi Digesto Vital), confirming tested steroid contents under PCSIR standards."
  },
  {
    src: "/certificates/PCSIR Chemical Analysis Certificate.png",
    title: "PCSIR Chemical Analysis Certificate",
    description:"Certified lab report verifying chemical composition and safety parameters of the submitted herbal product sample."
  },
  {
    src: "/certificates/PCSIR Quality Testing Report.png",  
    title: "PCSIR Quality Testing Report",
    description:"Official testing document confirming quality assessment and compliance checks of the product."
  },
  {
    src: "/certificates/PCSIR Laboratory Test Certificate.png",
    title: "PCSIR Laboratory Test Certificate",
    description:"Detailed laboratory evaluation report ensuring the product meets required testing standards."
  },
  {
    src: "/certificates/PCSIR Product Safety Report.png",
    title: "PCSIR Product Safety Report",
    description:"Safety analysis report highlighting tested ingredients and compliance with laboratory protocols."
  },
  {
    src: "/certificates/PCSIR Analytical Report.png",
    title: "PCSIR Analytical Report",
    description:"Professional analytical report covering detailed examination of product contents and quality."
  },
  {
    src: "/certificates/PCSIR Certification Report.png",
    title: "PCSIR Certification Report",
    description:"Final certification document confirming laboratory testing and verification of the submitted sample."
  }
]

/* =========================
   Page Component
========================= */
export default function CertificatesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf5e8]">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Certificates Removed</h1>
        <p className="text-sm text-[#5A5E55] max-w-md mx-auto mb-6">
          The certificates section has been deprecated for MM Laptop Center. If you need to add product guarantees or warranty documents, please use the admin panel to attach them to individual products.
        </p>
        <a href="/" className="inline-flex items-center rounded-full bg-[#f6a45d] px-6 py-2 text-sm font-semibold text-white hover:bg-[#d8861f]">Back to Home</a>
      </div>
    </div>
  );
}

