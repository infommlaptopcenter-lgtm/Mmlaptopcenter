import Link from "next/link";
import { FaApple } from "react-icons/fa";
import {
  SiAcer,
  SiAsus,
  SiDell,
  SiHp,
  SiLenovo,
  SiMsi,
  SiSamsung,
} from "react-icons/si";
import { SectionHeading } from "@/components/shared/section-heading";

const brands = [
  { name: "Apple", Icon: FaApple },
  { name: "Dell", Icon: SiDell },
  { name: "HP", Icon: SiHp },
  { name: "Lenovo", Icon: SiLenovo },
  { name: "ASUS", Icon: SiAsus },
  { name: "Acer", Icon: SiAcer },
  { name: "MSI", Icon: SiMsi },
  { name: "Samsung", Icon: SiSamsung },
] as const;

function BrandRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-5" aria-hidden={hidden || undefined}>
      {brands.map(({ name, Icon }) => (
        <div
          key={name}
          className="flex h-20 w-36 shrink-0 items-center justify-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 text-gray-800 sm:h-24 sm:w-44"
          aria-label={hidden ? undefined : name}
        >
          <Icon className="h-7 w-7 shrink-0 text-[#ea580c] sm:h-9 sm:w-9" aria-hidden="true" />
          <span className="text-base font-extrabold tracking-tight sm:text-lg">{name}</span>
        </div>
      ))}
    </div>
  );
}

export function TopBrandsSection() {
  return (
    <section className="overflow-hidden bg-[#f4f1e8] px-6 py-10 lg:px-4 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Top Brands"
          title="Shop Your Favourite Brands"
        />
        <div className="mt-4 flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-[#f47b20] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]"
          >
            Explore Products
          </Link>
        </div>
      </div>

      <div className="relative left-1/2 mt-9 w-screen -translate-x-1/2 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#f4f1e8] to-transparent sm:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f4f1e8] to-transparent sm:w-24" />
        <div className="brand-marquee flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          <BrandRow />
          <BrandRow hidden />
        </div>
      </div>
    </section>
  );
}
