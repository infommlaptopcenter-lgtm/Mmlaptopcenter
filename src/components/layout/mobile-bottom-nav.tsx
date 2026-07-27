"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Home, Phone, X } from "@esmate/shadcn/pkgs/lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { contact as trackContact } from "@/lib/pixel";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923048928282";
type Overlay = "chat" | "call" | "whatsapp" | null;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [message, setMessage] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const productsActive =
    pathname.startsWith("/products") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/collections");

  useEffect(() => {
    const handleChatState = (event: Event) => {
      const isOpen = (event as CustomEvent<{ open: boolean }>).detail?.open;
      setOverlay((current) =>
        isOpen ? "chat" : current === "chat" ? null : current,
      );
    };
    window.addEventListener("mobile-chat-state", handleChatState);
    return () =>
      window.removeEventListener("mobile-chat-state", handleChatState);
  }, []);

  useEffect(() => {
    if (overlay !== "call" && overlay !== "whatsapp") return;
    const closeOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOverlay(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [overlay]);

  const toggleChat = () => {
    const nextOpen = overlay !== "chat";
    setOverlay(nextOpen ? "chat" : null);
    window.dispatchEvent(
      new CustomEvent("toggle-mobile-chat", { detail: { open: nextOpen } }),
    );
  };

  const togglePopup = (next: "call" | "whatsapp") => {
    const nextOverlay = overlay === next ? null : next;
    if (overlay === "chat") {
      window.dispatchEvent(
        new CustomEvent("toggle-mobile-chat", { detail: { open: false } }),
      );
    }
    setOverlay(nextOverlay);
  };

  const closeOverlayForNavigation = () => {
    if (overlay === "chat") {
      window.dispatchEvent(
        new CustomEvent("toggle-mobile-chat", { detail: { open: false } }),
      );
    }
    setOverlay(null);
  };

  const sendWhatsApp = () => {
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message.trim())}`;
    trackContact("WhatsApp mobile navigation");
    window.open(url, "_blank", "noopener,noreferrer");
    setOverlay(null);
  };

  const itemClass = (active: boolean) =>
    `relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
      active
        ? "-translate-y-4 bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg ring-[5px] ring-[#1a1308]"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav
      ref={navRef}
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[60] md:hidden"
    >
      {overlay === "call" ? (
        <div
          role="dialog"
          aria-label="Confirm phone call"
          className="absolute bottom-[4.5rem] right-3 w-56 rounded-2xl bg-white p-4 text-sm shadow-2xl ring-1 ring-black/10"
        >
          <button
            type="button"
            onClick={() => setOverlay(null)}
            className="absolute right-2 top-2 rounded-full p-1 text-gray-500"
            aria-label="Close call prompt"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-5 font-semibold text-gray-900">
            Call MM Laptop Center?
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={`tel:+${PHONE_NUMBER}`}
              onClick={() => trackContact("Mobile phone call")}
              className="rounded-full bg-orange-500 px-3 py-2 font-semibold text-white"
            >
              Call now
            </a>
            <button
              type="button"
              onClick={() => setOverlay(null)}
              className="rounded-full bg-gray-100 px-3 py-2 font-semibold text-gray-700"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {overlay === "whatsapp" ? (
        <div
          role="dialog"
          aria-label="Send a WhatsApp message"
          className="absolute bottom-[4.5rem] left-3 right-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10"
        >
          <button
            type="button"
            onClick={() => setOverlay(null)}
            className="absolute right-2 top-2 rounded-full p-1 text-gray-500"
            aria-label="Close WhatsApp prompt"
          >
            <X className="h-4 w-4" />
          </button>
          <label
            htmlFor="mobile-whatsapp-message"
            className="text-sm font-semibold text-gray-900"
          >
            Message on WhatsApp
          </label>
          <textarea
            id="mobile-whatsapp-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="How can we help?"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="button"
            onClick={sendWhatsApp}
            className="mt-2 w-full rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white"
          >
            Send
          </button>
        </div>
      ) : null}

      <div className="rounded-t-2xl bg-[#1a1308] px-1.5 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,.2)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleChat}
            aria-label={overlay === "chat" ? "Close AI chat" : "Open AI chat"}
            aria-pressed={overlay === "chat"}
            className={itemClass(overlay === "chat")}
          >
            <BsChatDots className="h-5 w-5" />
          </button>
          <Link
            href="/products"
            onClick={closeOverlayForNavigation}
            aria-label="Products and categories"
            aria-current={productsActive ? "page" : undefined}
            className={itemClass(productsActive && !overlay)}
          >
            <Grid3X3 className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            onClick={closeOverlayForNavigation}
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
            className={itemClass(pathname === "/" && !overlay)}
          >
            <Home className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => togglePopup("call")}
            aria-label="Call us"
            aria-pressed={overlay === "call"}
            className={itemClass(overlay === "call")}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => togglePopup("whatsapp")}
            aria-label="Message us on WhatsApp"
            aria-pressed={overlay === "whatsapp"}
            className={itemClass(overlay === "whatsapp")}
          >
            <FaWhatsapp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
