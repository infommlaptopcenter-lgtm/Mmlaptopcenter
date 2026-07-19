import { getCollectionList } from "./service";
import { CollectionsPageContent } from "./_components/collections-page-content";
import { createSeoMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = createSeoMetadata({
  title: "Laptop and Tech Collections Pakistan",
  description: "Explore gaming laptops, business laptops, Apple MacBooks, Windows laptops, accessories, storage, memory and tech collections in Pakistan.",
  path: "/collections",
  keywords: ["Gaming Laptops", "Business Laptops", "Apple MacBooks", "Laptop Accessories", "Storage & Memory"],
});

export default async function Page() {
  let data: Awaited<ReturnType<typeof getCollectionList>> = {
    pageInfo: { hasNextPage: false },
    edges: [],
  };

  try {
    data = await getCollectionList();
  } catch (error) {
    console.error("Failed to load collections:", error);
  }

  return <CollectionsPageContent data={data} />;
}

