import { z } from "zod";
import type { Video } from "@prisma/client";

export const VIDEO_PLATFORMS = ["YOUTUBE", "TIKTOK", "FACEBOOK", "INSTAGRAM"] as const;
export const VIDEO_PLACEMENTS = ["HOMEPAGE", "ABOUT", "VIDEOS_PAGE"] as const;

export type VideoPlatformValue = (typeof VIDEO_PLATFORMS)[number];
export type VideoPlacementValue = (typeof VIDEO_PLACEMENTS)[number];

export const VIDEO_PLATFORM_LABELS: Record<VideoPlatformValue, string> = {
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

export const VIDEO_PLACEMENT_LABELS: Record<VideoPlacementValue, string> = {
  HOMEPAGE: "Homepage",
  ABOUT: "About Page",
  VIDEOS_PAGE: "Videos Page",
};

export const videoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().nullable(),
  thumbnail: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().url("Enter a valid video URL"),
  platform: z.enum(VIDEO_PLATFORMS),
  placement: z.enum(VIDEO_PLACEMENTS).default("VIDEOS_PAGE"),
  buttonText: z.string().trim().optional().nullable(),
  buttonUrl: z.string().trim().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
});

export type VideoFormPayload = z.infer<typeof videoSchema>;

export type PublicVideo = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string;
  embedUrl: string | null;
  platform: VideoPlatformValue;
  placement: VideoPlacementValue;
  buttonText: string | null;
  buttonUrl: string | null;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function getYoutubeId(url: URL) {
  if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
  if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || "";
  if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || "";
  return url.searchParams.get("v") || "";
}

function getTikTokId(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const videoIndex = parts.indexOf("video");
  return videoIndex >= 0 ? parts[videoIndex + 1] || "" : "";
}

function instagramEmbed(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const kind = parts[0];
  const code = parts[1];
  if (!["p", "reel", "tv"].includes(kind) || !code) return null;
  return `https://www.instagram.com/${kind}/${code}/embed`;
}

export function buildVideoEmbedUrl(platform: VideoPlatformValue, videoUrl: string) {
  const url = safeUrl(videoUrl);
  if (!url) return null;

  if (platform === "YOUTUBE") {
    const id = getYoutubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (platform === "TIKTOK") {
    const id = getTikTokId(url);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }

  if (platform === "FACEBOOK") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false&width=734`;
  }

  return instagramEmbed(url);
}

export function prepareVideoData(input: unknown) {
  const validated = videoSchema.parse(input);
  const buttonUrl = validated.buttonUrl ? safeUrl(validated.buttonUrl)?.toString() ?? null : null;

  return {
    ...validated,
    description: validated.description || null,
    thumbnail: validated.thumbnail || null,
    embedUrl: buildVideoEmbedUrl(validated.platform, validated.videoUrl),
    buttonText: validated.buttonText || null,
    buttonUrl,
    seoTitle: validated.seoTitle || null,
    seoDescription: validated.seoDescription || null,
  };
}

export function serializeVideo(video: Video): PublicVideo {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    videoUrl: video.videoUrl,
    embedUrl: video.embedUrl,
    platform: video.platform,
    placement: video.placement,
    buttonText: video.buttonText,
    buttonUrl: video.buttonUrl,
    featured: video.featured,
    active: video.active,
    displayOrder: video.displayOrder,
    seoTitle: video.seoTitle,
    seoDescription: video.seoDescription,
  };
}
