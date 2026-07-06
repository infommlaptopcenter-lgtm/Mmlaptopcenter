export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type CategoryItem = { id: string; name: string; parentId?: string | null };
export type CollectionItem = { id: string; title: string };

export type ProductDetail = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

export type ProductCertificate = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

export type ProductFormValues = {
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  inventory: number;
  availableForSale: boolean;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  images: string[];
  featuredImage?: string;
  productType?: string;
  categoryId?: string;
  subcategoryId?: string;
  vendor?: string;
  tags: string[];
  collectionIds: string[];
  isFeatured: boolean;
  variations: Array<{ name: string; value: string; price: number }>;
  details: ProductDetail[];
  certificates: ProductCertificate[];
};
