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
    href: "https://www.facebook.com/mmlaptopcenter",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mmlaptopcenter",
    icon: FaInstagram,
  },
  { name: "TikTok", href: null, icon: FaTiktok },
  { name: "YouTube", href: null, icon: FaYoutube },
  { name: "WhatsApp Channel", href: null, icon: FaWhatsapp },
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
        const content = <Icon className={iconClassName} aria-hidden="true" />;

        return item.href ? (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow MM Laptop Center on ${item.name}`}
            title={item.name}
            className={itemClassName}
          >
            {content}
          </a>
        ) : (
          <span
            key={item.name}
            aria-label={`${item.name} link coming soon`}
            title={`${item.name} link coming soon`}
            className={`${itemClassName} cursor-default opacity-70`}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
