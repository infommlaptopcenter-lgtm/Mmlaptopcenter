import Image from "next/image";

type ExtraProductDetail = {
  id: string;
  title: string;
  description?: string;
  image?: string;
};

export function ExtraProductDetails({ details }: { details: ExtraProductDetail[] }) {
  const visibleDetails = details.filter((detail) => detail.title || detail.description || detail.image);

  if (!visibleDetails.length) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-orange-200/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.9))] p-4 shadow-sm sm:p-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700">Product Highlights</p>
        <h2 className="mt-2 font-serif text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl">
          Extra Product Details
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {visibleDetails.map((detail, index) => {
          const reverse = index % 2 === 1;

          return (
            <article
              key={detail.id}
              className="grid overflow-hidden rounded-2xl bg-white/80 shadow-[0_14px_36px_rgba(26,19,8,0.07)] ring-1 ring-orange-100/90 lg:grid-cols-2"
            >
              {detail.image ? (
                <div className={`relative min-h-[220px] bg-orange-50 sm:min-h-[280px] ${reverse ? "lg:order-2" : ""}`}>
                  <Image
                    src={detail.image}
                    alt={detail.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <div className={`flex flex-col justify-center p-5 sm:p-7 lg:p-8 ${!detail.image ? "lg:col-span-2" : ""}`}>
                <span className="mb-3 inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  Detail {index + 1}
                </span>
                <h3 className="font-serif text-2xl font-extrabold leading-tight text-gray-950 sm:text-3xl">
                  {detail.title}
                </h3>
                {detail.description ? (
                  <div className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-gray-700 sm:text-base">
                    {detail.description}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
