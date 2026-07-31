import Link from "next/link";
import { Mail, MapPin, Phone } from "@esmate/shadcn/pkgs/lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SocialLinks } from "@/components/layout/social-links";

export async function Footer() {
  const categories = await prisma.category
    .findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: 8,
      select: { id: true, name: true, slug: true },
    })
    .catch((error) => {
      console.warn("Unable to load footer categories:", error);
      return [];
    });

  return (
    <footer className="bg-[#f4f1e8] border-t border-[#d8a928]/30">
      <div className="w-full px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand / Logo */}
          <div className="col-span-2 space-y-4 lg:col-span-1">
            <Link href="/" className="-m-1.5 flex items-center gap-3 p-1.5">
              <span className="sr-only">MM Laptop Center</span>
              <Image
                src="/logo/new logo.png?v=20260731"
                alt="MM Laptop Center"
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
              />
              <span className="leading-tight">
                <span className="block text-lg font-bold tracking-wide text-[#172533]">
                  MM LAPTOP CENTER
                </span>
                <span className="mt-1 block text-xs text-[#6b6255]">
                  Premium Laptops &amp; Tech
                </span>
              </span>
            </Link>

            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Your Trusted Tech Destination — premium laptops, gaming gear, and accessories with genuine warranty support.
            </p>

            <SocialLinks
              className="gap-2.5"
              itemClassName="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8a928]/25 bg-white text-[#b57910] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a928] hover:bg-[#d8a928] hover:text-white"
              iconClassName="h-4 w-4"
            />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Shop</h3>
            <ul role="list" className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Customer Care</h3>
            <ul role="list" className="mt-4 space-y-2">
              <li>
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
              
              <li>
                <Link href="/about-us" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#d8a928] shrink-0" />
                <span>Sardheri Bazar Charsadda Mardan Road KPK Pakistan | All Pakistan delivery available</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#d8a928] shrink-0" />
                <span>+92 304 8928282</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#d8a928] shrink-0" />
                <span>info.mmlaptopcenter@gmail.com</span>
              </div>
              <div className="pt-2">
                <span className="text-xs text-gray-500">Founder: Mudassir Meer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#d8a928]/30 pt-8">
          <p className="text-center text-xs leading-5 text-gray-600">
            &copy; {new Date().getFullYear()} MM Laptop Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
