import { prisma } from "@/lib/prisma"
import { serializeVideo } from "@/lib/video-utils"
import { FeaturedVideoSection } from "@/components/features/videos/featured-video-section"
import { AboutPageContent } from "./_components/about-page-content"
import { createSeoMetadata } from "@/lib/seo"

export const metadata = createSeoMetadata({
  title: "About MM Laptop Center Charsadda",
  description: "Learn about MM Laptop Center Charsadda, KPK: over 20 years supplying authentic MacBooks, gaming laptops, business laptops and tech accessories across Pakistan.",
  path: "/about-us",
  keywords: ["MM Laptop Center Charsadda", "Laptop Shop KPK", "MacBook Pakistan", "Mudassir Meer"],
})

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const aboutVideos = await prisma.video.findMany({
    where: { active: true, placement: "ABOUT" },
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    take: 8,
  });

  return (
    <>
      <AboutPageContent />
      <FeaturedVideoSection
        videos={aboutVideos.map(serializeVideo)}
        heading="Meet our work through video"
        description="A separate featured story for the about page, managed from the admin video module."
      />
    </>
  );
}


