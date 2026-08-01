import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { legalPageDefaults, type LegalPageData, type LegalPageSlug } from "@/lib/legal-pages";

const slugs: LegalPageSlug[] = ["faq", "privacy", "terms", "refund-policy"];

export async function GET() {
  try {
    await requireAdmin();
    const stored = await prisma.siteSetting.findMany({ where: { key: { in: slugs.map((slug) => `legalPage:${slug}`) } } });
    const pages = { ...legalPageDefaults } as Record<LegalPageSlug, LegalPageData>;
    for (const item of stored) {
      const slug = item.key.replace("legalPage:", "") as LegalPageSlug;
      if (slugs.includes(slug)) pages[slug] = { ...legalPageDefaults[slug], ...(item.value as Partial<LegalPageData>), slug };
    }
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const page = await request.json() as LegalPageData;
    if (!slugs.includes(page.slug) || !page.title?.trim() || !page.description?.trim()) {
      return NextResponse.json({ error: "A valid page, title, and description are required." }, { status: 400 });
    }
    await prisma.siteSetting.upsert({ where: { key: `legalPage:${page.slug}` }, update: { value: page as any }, create: { key: `legalPage:${page.slug}`, value: page as any } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
