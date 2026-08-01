import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61567513306151",
    label: "Visit our Facebook page",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mmlaptopcenter1/",
    label: "Follow us on Instagram",
    icon: FaInstagram,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mmlaptopcenter",
    label: "Follow us on TikTok",
    icon: FaTiktok,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@MMLaptopCenter-CHD",
    label: "Visit our YouTube channel",
    icon: FaYoutube,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/923048928282",
    label: "Chat with us on WhatsApp",
    icon: FaWhatsapp,
  },
] as const;

export function SocialLinks({
  className = "",
  itemClassName = "",
  iconClassName = "h-4 w-4",
}: {
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center ${className}`} aria-label="Social media">
      {socialLinks.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className={`group relative last:[&>span]:left-auto last:[&>span]:right-0 last:[&>span]:translate-x-0 ${itemClassName}`}
          >
            <Icon className={iconClassName} aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-48 -translate-x-1/2 translate-y-1 rounded-md bg-[#1a1308] px-2.5 py-1.5 text-[11px] font-semibold leading-none whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
