"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Play } from "@esmate/shadcn/pkgs/lucide-react";
import { useState } from "react";
import { VIDEO_PLATFORM_LABELS, type PublicVideo } from "@/lib/video-utils";

type VideoCardProps = {
  video: PublicVideo;
  variant?: "landscape" | "vertical" | "facebook";
  autoPlay?: boolean;
};

function playerUrl(video: PublicVideo, autoPlay: boolean) {
  if (!video.embedUrl || !autoPlay) return video.embedUrl;

  const url = new URL(video.embedUrl);
  if (video.platform === "FACEBOOK") {
    url.searchParams.set("autoplay", "true");
    url.searchParams.set("mute", "true");
  } else {
    url.searchParams.set("autoplay", "1");
    url.searchParams.set(video.platform === "TIKTOK" ? "muted" : "mute", "1");
  }
  return url.toString();
}

export function VideoCard({ video, autoPlay = false }: VideoCardProps) {
  const [playing, setPlaying] = useState(autoPlay);
  const isVertical = video.format === "VERTICAL";
  const embedUrl = playerUrl(video, autoPlay);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#d8a928]/20 bg-white shadow-sm transition hover:border-[#f6a45d] hover:shadow-lg">
      <div
        className={`relative w-full overflow-hidden bg-black ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}
      >
        {embedUrl && playing ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="h-full w-full"
            loading={autoPlay ? "eager" : "lazy"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : embedUrl ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group/player relative flex h-full w-full items-center justify-center"
            aria-label={`Play ${video.title}`}
          >
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-contain"
              />
            ) : (
              <span className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            )}
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition group-hover/player:scale-110">
              <Play className="ml-0.5 h-7 w-7 fill-current" />
            </span>
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-white">
            This video cannot be embedded.
          </div>
        )}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
          {VIDEO_PLATFORM_LABELS[video.platform]}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight text-gray-950">
          {video.title}
        </h3>
        {video.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
            {video.description}
          </p>
        ) : null}
        {video.buttonText && video.buttonUrl ? (
          <Link
            href={video.buttonUrl}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ea580c] hover:text-[#b94a08]"
          >
            {video.buttonText}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
