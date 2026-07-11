"use client";

import { useMemo, useState } from "react";
import { VIDEO_PLATFORM_LABELS, VIDEO_PLATFORMS, type PublicVideo, type VideoPlatformValue } from "@/lib/video-utils";
import { VideoCard } from "./video-card";
import { SharedVideoPlayer } from "./shared-video-player";

const PAGE_SIZE = 8;

function variantFor(platform: VideoPlatformValue) {
  if (platform === "TIKTOK" || platform === "INSTAGRAM") return "vertical" as const;
  if (platform === "FACEBOOK") return "facebook" as const;
  return "landscape" as const;
}

export function VideosPageClient({ videos }: { videos: PublicVideo[] }) {
  const [platform, setPlatform] = useState<VideoPlatformValue | "ALL">("ALL");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => (platform === "ALL" ? videos : videos.filter((video) => video.platform === platform)),
    [platform, videos],
  );

  const visibleVideos = filtered.slice(0, visible);
  const featuredVideos = filtered.filter((video) => video.featured).slice(0, 4);

  return (
    <main className="bg-gray-50 text-[#0a0a0a]">
      <section className="border-b border-[#d8a928]/25 bg-[#fcf5e8] px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full bg-[#ffedd5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              MM Laptop Center Videos
            </span>
            <h1 className="font-serif text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Product demos, tech guides, and shop updates.
            </h1>
            <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
              Watch our latest laptop showcases, buying guides, repairs, reels, and customer-focused videos across every platform.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setPlatform("ALL");
                setVisible(PAGE_SIZE);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${platform === "ALL" ? "bg-[#1a1308] text-white" : "bg-white text-gray-700 hover:bg-[#fcf5e8]"}`}
            >
              All
            </button>
            {VIDEO_PLATFORMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setPlatform(item);
                  setVisible(PAGE_SIZE);
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${platform === item ? "bg-[#1a1308] text-white" : "bg-white text-gray-700 hover:bg-[#fcf5e8]"}`}
              >
                {VIDEO_PLATFORM_LABELS[item]}
              </button>
            ))}
          </div>

          {featuredVideos.length ? (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-gray-950">Featured Videos</h2>
              <SharedVideoPlayer videos={featuredVideos} />
            </section>
          ) : null}

          {platform === "ALL" ? (
            <div className="space-y-10">
              {VIDEO_PLATFORMS.map((item) => {
                const platformVideos = visibleVideos.filter((video) => video.platform === item);
                if (!platformVideos.length) return null;
                return (
                  <section key={item} className="space-y-4">
                    <h2 className="font-serif text-2xl font-bold text-gray-950">{VIDEO_PLATFORM_LABELS[item]}</h2>
                    <div className={`grid gap-5 ${item === "TIKTOK" || item === "INSTAGRAM" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                      {platformVideos.map((video) => (
                        <VideoCard key={video.id} video={video} variant={variantFor(video.platform)} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-gray-950">{VIDEO_PLATFORM_LABELS[platform]}</h2>
              <div className={`grid gap-5 ${platform === "TIKTOK" || platform === "INSTAGRAM" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                {visibleVideos.map((video) => (
                  <VideoCard key={video.id} video={video} variant={variantFor(video.platform)} />
                ))}
              </div>
            </section>
          )}

          {!filtered.length ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm font-semibold text-gray-500">
              No active videos are available for this platform yet.
            </div>
          ) : null}

          {visible < filtered.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="rounded-full bg-[#1a1308] px-6 py-3 text-sm font-bold text-white hover:bg-[#2a2118]"
              >
                Load More
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
