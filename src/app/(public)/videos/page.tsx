import { prisma } from "@/lib/prisma";
import { serializeVideo } from "@/lib/video-utils";
import { VideosPageClient } from "@/components/features/videos/videos-page-client";
import { createSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createSeoMetadata({
  title: "Laptop Videos and Tech Guides Pakistan",
  description: "Watch MM Laptop Center product demos, laptop buying guides, MacBook videos, gaming laptop advice and tech updates for Pakistan.",
  path: "/videos",
  keywords: ["Laptop guides Pakistan", "Gaming laptop videos", "MacBook Pakistan"],
});

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return <VideosPageClient videos={videos.map(serializeVideo)} />;
}
