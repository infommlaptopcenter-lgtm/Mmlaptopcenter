"use client";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { FaqItem } from "@/lib/legal-pages";

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-4xl">
    <div className="mb-10 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-500">Everything you need to know</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">How can we help?</h2></div>
    <div className="space-y-3">{items.map((item, index) => { const isOpen = open === item.id; return <article key={item.id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"><button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.id)} className="flex w-full items-center gap-4 p-5 text-left sm:p-6"><span className="font-black text-orange-400">{String(index + 1).padStart(2, "0")}</span><span className="flex-1 font-bold sm:text-lg">{item.question}</span><FiChevronDown className={`h-5 w-5 shrink-0 text-orange-500 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="border-t border-orange-50 px-5 py-5 pl-[4.25rem] text-sm leading-7 text-stone-600 sm:px-6 sm:pl-[4.75rem] sm:text-base" dangerouslySetInnerHTML={{ __html: item.answer }} />}</article> })}</div>
  </div></section>;
}
