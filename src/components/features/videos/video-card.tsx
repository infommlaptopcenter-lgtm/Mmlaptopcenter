"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Play } from "@esmate/shadcn/pkgs/lucide-react";
import { VIDEO_PLATFORM_LABELS, type PublicVideo } from "@/lib/video-utils";
import { VideoPlayerModal } from "./video-player-modal";

type VideoCardProps = {
  video: PublicVideo;
  variant?: "landscape" | "vertical" | "facebook";
};

export function VideoCard({ video, variant = "landscape" }: VideoCardProps) {
  const [open, setOpen] = useState(false);
  const isVertical = variant === "vertical";

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-[#d8a928]/20 bg-white shadow-sm transition hover:border-[#f6a45d] hover:shadow-lg">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`relative block w-full overflow-hidden bg-gray-100 ${isVertical ? "aspect-[9/14]" : "aspect-video"}`}
        >
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes={isVertical ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1280px) 33vw, 50vw"}
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a1308] text-[#f6a45d]">
              <Play className="h-10 w-10" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
            {VIDEO_PLATFORM_LABELS[video.platform]}
          </span>
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f6a45d] text-black shadow-lg">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>
        </button>

        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight text-gray-950">{video.title}</h3>
          {video.description ? <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{video.description}</p> : null}
          {video.buttonText && video.buttonUrl ? (
            <Link href={video.buttonUrl} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ea580c] hover:text-[#b94a08]">
              {video.buttonText}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </article>
      <VideoPlayerModal open={open} title={video.title} embedUrl={video.embedUrl} onClose={() => setOpen(false)} />
    </>
  );
}
