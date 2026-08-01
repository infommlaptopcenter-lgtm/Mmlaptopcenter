import { getLegalPage, type LegalPageSlug } from "@/lib/legal-pages";
import { LegalPageShell, PolicySections } from "../../_components/legal-page-shell";

export const dynamic = "force-dynamic";

interface PolicyPageContentProps {
  slug: Exclude<LegalPageSlug, "faq">;
}

export async function PolicyPageContent({
  slug,
}: PolicyPageContentProps) {
  const page = await getLegalPage(slug);
  return <LegalPageShell page={page}><PolicySections page={page} /></LegalPageShell>;
}
