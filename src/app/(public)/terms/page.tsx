import { PolicyPageContent } from "../privacy/_components/policy-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Terms and Conditions",
  description: "Terms and conditions for using MM Laptop Center Pakistan and purchasing laptops and accessories.",
  path: "/terms",
});

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <PolicyPageContent
      keyName="termsOfService"
      title="Terms and Conditions"
      fallbackBody="<p>Welcome to MM Laptop Center. These terms and conditions outline the rules and regulations for the use of our Website.</p>"
    />
  );
}

