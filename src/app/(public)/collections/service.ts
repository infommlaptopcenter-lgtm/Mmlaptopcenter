
import { getAllCollections } from "@/lib/storefront";
import { invariant } from "@/lib/string-utils";

export async function getCollectionList(cursor?: string) {
  const collections = await getAllCollections(cursor);
  invariant(collections, "collections are not available");
  return collections;
}

