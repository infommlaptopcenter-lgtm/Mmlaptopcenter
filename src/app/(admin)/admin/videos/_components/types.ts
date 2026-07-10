import type { VideoPlatformValue, VideoPlacementValue } from "@/lib/video-utils";

export type AdminVideo = {
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

export type VideoFormValues = Omit<AdminVideo, "id" | "embedUrl">;

export const emptyVideoFormValues: VideoFormValues = {
  title: "",
  description: "",
  thumbnail: "",
  videoUrl: "",
  platform: "YOUTUBE",
  placement: "VIDEOS_PAGE",
  buttonText: "",
  buttonUrl: "",
  featured: false,
  active: true,
  displayOrder: 0,
  seoTitle: "",
  seoDescription: "",
};
