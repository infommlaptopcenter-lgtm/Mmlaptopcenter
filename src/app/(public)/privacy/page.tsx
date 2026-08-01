import { PolicyPageContent } from "./_components/policy-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Privacy Policy",
  description: "Read how MM Laptop Center Pakistan collects, uses and protects customer information.",
  path: "/privacy",
});

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <PolicyPageContent slug="privacy" />
  );
}

