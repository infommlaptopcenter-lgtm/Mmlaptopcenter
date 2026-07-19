import { CartPageContent } from "./_components/cart-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Shopping Cart",
  description: "Review products selected from MM Laptop Center before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function Page() {
  return (
    <main className="min-h-screen bg-[#fcf5e8]">
      <CartPageContent />
    </main>
  );
}

