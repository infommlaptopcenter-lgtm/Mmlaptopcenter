"use client";

import Link from "next/link";
import { Play, Video } from "@esmate/shadcn/pkgs/lucide-react";
import type { PublicVideo } from "@/lib/video-utils";
import { VideoCard } from "./video-card";

export function FeaturedVideoSection({
  video,
  heading,
  description,
}: {
  video: PublicVideo | null;
  heading: string;
  description: string;
}) {
  if (!video) return null;

  return (
    <section className="bg-white px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ffedd5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ea580c]">
            <Video className="h-4 w-4" />
            Featured Video
          </span>
          <h2 className="font-serif text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/videos" className="inline-flex items-center gap-2 rounded-full bg-[#1a1308] px-6 py-3 text-sm font-bold text-white hover:bg-[#2a2118]">
              View All Videos
            </Link>
            <a href={video.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#d8a928]/40 bg-white px-6 py-3 text-sm font-bold text-gray-950 hover:bg-[#fcf5e8]">
              <Play className="h-4 w-4" />
              Watch on Platform
            </a>
          </div>
        </div>
        <VideoCard
          video={video}
          variant={video.platform === "TIKTOK" || video.platform === "INSTAGRAM" ? "vertical" : "landscape"}
          autoPlay
        />
      </div>
    </section>
  );
}
