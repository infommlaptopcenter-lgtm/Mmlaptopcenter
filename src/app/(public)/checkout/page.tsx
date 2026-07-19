import { CheckoutPageContent } from "./_components/checkout-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Secure Checkout",
  description: "Complete your MM Laptop Center Pakistan order securely.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
