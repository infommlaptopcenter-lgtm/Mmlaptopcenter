import { CollectionList } from "../collection-list";
import { getCollectionList } from "../service";

type CollectionsPageContentProps = {
  data: Awaited<ReturnType<typeof getCollectionList>>;
};

export async function CollectionsPageContent({ data }: CollectionsPageContentProps) {
  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17130d]">
      <section className="relative isolate overflow-hidden bg-[#f4f1e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(249,115,22,.14),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-400">
              Curated by MM Laptop Center
            </p>
            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-normal text-[#ea580c] sm:text-6xl lg:text-7xl">
              Explore Our Collections
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              Browse thoughtfully grouped laptops, gaming gear, accessories,
              new arrivals, and special offers selected to make finding the
              right technology simple.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-stone-700">
              <span className="rounded-full border border-orange-100 bg-white/70 px-3 py-1.5">Quality checked</span>
              <span className="rounded-full border border-orange-100 bg-white/70 px-3 py-1.5">Nationwide delivery</span>
              <span className="rounded-full border border-orange-100 bg-white/70 px-3 py-1.5">Local support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Shop your way</p>
          <h2 className="mt-2 font-serif text-2xl font-extrabold text-[#ea580c] sm:text-3xl">Find the right collection for you</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Browse clear product groups designed to help you find the right technology faster.
          </p>
        </div>
        <CollectionList data={data} />
      </section>

      <section className="border-t border-orange-100 bg-white/45">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="max-w-4xl space-y-4 leading-relaxed text-stone-600">
          <h2 className="font-serif text-2xl font-extrabold text-[#ea580c]">
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
