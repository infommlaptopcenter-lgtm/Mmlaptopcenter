import { CategoriesSection, ProductsSection } from "@/components/features/home/products-section";
import { WhyChooseUsSection } from "@/components/features/home/why-choose-us";
import { FeaturedBlogSection } from "@/components/features/home/featured-blog-section";
import { CustomerVoicesSection } from "@/components/features/home/customer-voices-section";

type HomeContentSectionsProps = {
  categories: Array<{ id: string; name: string; slug: string; image: string | null }>;
  products: Array<any>;
  collections: Array<{ id: string; handle: string; title: string; image: string | null }>;
  featuredBlogs: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    publishedAt?: Date | string | null;
    content?: string | null;
  }>;
};

export function HomeContentSections({
  categories,
  products,
  collections,
  featuredBlogs,
}: HomeContentSectionsProps) {
  return (
    <>
      <CategoriesSection categories={categories} />
      <ProductsSection categories={categories} products={products} collections={collections} />
      <WhyChooseUsSection />
      <FeaturedBlogSection articles={featuredBlogs} />
      <CustomerVoicesSection />
    </>
  );
}
