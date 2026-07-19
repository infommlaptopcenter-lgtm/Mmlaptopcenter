import { Suspense } from "react";
import CheckoutSuccessClient from "./success-client";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Order Confirmed",
  description: "Your MM Laptop Center order confirmation.",
  path: "/checkout/success",
  noIndex: true,
});

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}

