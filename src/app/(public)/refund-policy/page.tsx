import { PolicyPageContent } from "../privacy/_components/policy-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Refund Policy",
  description: "Review the refund and return policy for laptops and tech accessories purchased from MM Laptop Center Pakistan.",
  path: "/refund-policy",
});

export const dynamic = "force-dynamic";

export default function RefundPolicyPage() {
  return (
    <PolicyPageContent slug="refund-policy" />
  );
}

