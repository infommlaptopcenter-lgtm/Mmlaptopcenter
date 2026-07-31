import { CollectionList } from "../collection-list";
import { getCollectionList } from "../service";

type CollectionsPageContentProps = {
  data: Awaited<ReturnType<typeof getCollectionList>>;
};

export async function CollectionsPageContent({ data }: CollectionsPageContentProps) {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff7df] via-[#fcf5e8] to-[#f4e2b7]">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#d8a928]/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#f6a45d]/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b57910]">
              Curated by MM Laptop Center
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#172533] sm:text-5xl">
              Explore Our Collections
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5A5E55] sm:text-lg">
              Browse thoughtfully grouped laptops, gaming gear, accessories,
              new arrivals, and special offers selected to make finding the
              right technology simple.
            </p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-[#6b4b0b]">
              <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Quality checked</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Nationwide delivery</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Local support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b57910]">Shop your way</p>
          <h2 className="mt-2 text-2xl font-bold text-[#172533] sm:text-3xl">Find the collection for you</h2>
          <p className="mt-2 text-sm leading-6 text-[#5A5E55]">
            Every collection is managed from the admin dashboard and updates automatically as products are assigned.
          </p>
        </div>
        <CollectionList data={data} />
      </section>

      <section className="bg-[#fcf5e8]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="max-w-4xl space-y-4 text-[#5A5E55] leading-relaxed">
          <h2 className="text-2xl font-bold text-[#172533]">
            Technology selected with confidence
          </h2>
          <p>
            MM Laptop Center organizes products into clear collections so you
            can compare suitable laptops, accessories, and offers without
            searching through unrelated items. Collection availability and
            product assignments stay synchronized with our current catalog.
          </p>
          </div>
        </div>
      </section>
    </main>
  );
}
