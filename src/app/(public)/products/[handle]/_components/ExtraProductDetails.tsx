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
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b1a1a]">Product Highlights</p>
        <h2 className="mt-2 text-2xl font-bold text-[#0a0a0a] sm:text-3xl">Extra Product Details</h2>
      </div>

      <div className="space-y-5">
        {visibleDetails.map((detail, index) => {
          const reverse = index % 2 === 1;

          return (
            <article
              key={detail.id}
              className="grid overflow-hidden rounded-xl border border-[#d8a928]/20 bg-white shadow-sm lg:grid-cols-2"
            >
              {detail.image ? (
                <div className={`relative min-h-[240px] bg-[#f4f1e8] ${reverse ? "lg:order-2" : ""}`}>
                  <Image
                    src={detail.image}
                    alt={detail.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <div className={`flex flex-col justify-center p-6 sm:p-8 ${!detail.image ? "lg:col-span-2" : ""}`}>
                <span className="mb-3 inline-flex w-fit rounded-full bg-[#f4f1e8] px-3 py-1 text-xs font-bold text-[#8b1a1a]">
                  Detail {index + 1}
                </span>
                <h3 className="text-xl font-bold text-[#0a0a0a] sm:text-2xl">{detail.title}</h3>
                {detail.description ? (
                  <div className="mt-3 whitespace-pre-line text-sm leading-7 text-[#5A5E55]">
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
