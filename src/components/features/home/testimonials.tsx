"use client";

import { ChevronLeft, ChevronRight } from "@esmate/shadcn/pkgs/lucide-react";
import { useCallback, useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Ahmed Raza",
    role: "Software Developer – Lahore",
    text: "Bought an ASUS ROG Strix from MM Laptop Center. Runs every game at max settings. Genuine product with full warranty!",
  },
  {
    name: "Ayesha Siddiqua",
    role: "University Student – Karachi",
    text: "Got my MacBook Air M2 here at a great price. Lightweight, fast, and the team helped me pick the right specs.",
  },
  {
    name: "Dr. Usman Malik",
    role: "Clinic Owner – Islamabad",
    text: "Ordered 5 Dell business laptops for our clinic. All arrived configured and ready. Excellent bulk order support.",
  },
  {
    name: "Fatima Noor",
    role: "Graphic Designer – Faisalabad",
    text: "The Dell XPS 15 display is stunning for my design work. MM Laptop Center delivered exactly what I needed.",
  },
  {
    name: "Muhammad Bilal",
    role: "Esports Player – Multan",
    text: "Best gaming laptop shop in Pakistan. Got my MSI Katana with RTX 4050 — smooth 144Hz gaming every day.",
  },
  {
    name: "Hassan Ali",
    role: "Freelancer – Rawalpindi",
    text: "Picked up a ThinkPad X1 Carbon and a Logitech mouse. Professional service and competitive pricing.",
  },
  {
    name: "Sana Tariq",
    role: "Teacher – Peshawar",
    text: "Affordable HP Pavilion for online teaching. Battery lasts all day and the screen is crisp and clear.",
  },
  {
    name: "Imran Shah",
    role: "IT Manager – Quetta",
    text: "We source all our office laptops from MM Laptop Center. Reliable, genuine, and always responsive.",
  },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const atEnd =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    const atStart = track.scrollLeft <= 2;

    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({
        left: direction * track.clientWidth,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [move]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => move(-1)}
        className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#fcf5e8] p-2 shadow-md transition hover:bg-[#f6a45d] hover:text-white md:block"
        aria-label="Previous customer reviews"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto px-0 md:px-8"
      >
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="w-full shrink-0 snap-start sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]"
          >
            <div className="h-full rounded-xl border border-[#d8a928]/20 bg-[#f4f1e8] p-6">
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="text-lg text-[#d8a928]"
                  >
                    ★
                  </span>
                ))}
                <span className="sr-only">5 out of 5 stars</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#5A5E55]">
                &quot;{testimonial.text}&quot;
              </p>
              <p className="font-semibold text-[#0a0a0a]">
                {testimonial.name}
              </p>
              <p className="text-xs text-[#5A5E55]">{testimonial.role}</p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => move(1)}
        className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#fcf5e8] p-2 shadow-md transition hover:bg-[#f6a45d] hover:text-white md:block"
        aria-label="Next customer reviews"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
