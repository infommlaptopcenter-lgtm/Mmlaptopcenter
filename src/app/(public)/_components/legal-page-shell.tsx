import Link from "next/link";
import { FiCheckCircle, FiClock, FiHeadphones, FiShield, FiTruck } from "react-icons/fi";
import type { LegalPageData } from "@/lib/legal-pages";

const links = [
  ["FAQ", "/faq"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Refunds", "/refund-policy"],
];

export function LegalPageShell({ page, children }: { page: LegalPageData; children: React.ReactNode }) {
  return <main className="overflow-hidden bg-[#fffaf2] text-[#17130d]">
    <section className="relative isolate min-h-[440px] overflow-hidden bg-[#18120c] px-5 py-20 sm:min-h-[500px] sm:px-8 sm:py-28">
      <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-[0.08] grayscale" style={{ backgroundImage: `url('${page.heroImage}')` }} />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(249,115,22,.23),transparent_38%),linear-gradient(110deg,#18120c_20%,rgba(24,18,12,.82))]" />
      <div className="relative mx-auto max-w-6xl">
        <nav aria-label="Legal pages" className="mb-12 flex flex-wrap gap-2">
          {links.map(([label, href]) => <Link key={href} href={href} className={`rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm ${href === `/${page.slug}` ? "border-orange-400 bg-orange-500 text-white" : "border-white/15 bg-white/5 text-white/70 hover:border-orange-400/60 hover:text-white"}`}>{label}</Link>)}
        </nav>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-orange-400">{page.eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">{page.title} <span className="text-orange-400">{page.titleHighlight}</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">{page.description}</p>
        <div className="mt-8 flex items-center gap-2 text-sm text-white/55"><FiClock className="text-orange-400" /> Last updated {page.lastUpdated}</div>
      </div>
    </section>

    <section aria-label="Why customers trust us" className="relative z-10 mx-auto -mt-7 max-w-6xl px-4 sm:px-8">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_18px_60px_rgba(61,39,12,.12)] lg:grid-cols-4">
        {[ [FiCheckCircle, "Quality checked", "Devices inspected"], [FiTruck, "Pakistan-wide", "Reliable delivery"], [FiShield, "Clear coverage", "Warranty guidance"], [FiHeadphones, "Real support", "People who listen"] ].map(([Icon, title, text], index) => <div key={String(title)} className={`flex items-center gap-3 p-4 sm:p-6 ${index % 2 ? "border-l border-orange-100" : ""} ${index > 1 ? "border-t border-orange-100 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500"><Icon className="h-5 w-5" /></span><span><strong className="block text-sm sm:text-base">{String(title)}</strong><small className="text-xs text-stone-500 sm:text-sm">{String(text)}</small></span></div>)}
      </div>
    </section>
    {children}
    <section className="px-5 pb-20 sm:px-8 sm:pb-28"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#1d160e] p-7 sm:flex-row sm:items-center sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-400">We are here to help</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Still need a clear answer?</h2><p className="mt-2 text-white/60">Talk to our team before you make a decision.</p></div><Link href="/contact" className="rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600">Contact our team</Link></div></section>
  </main>;
}

export function PolicySections({ page }: { page: LegalPageData }) {
  return <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[260px_1fr]">
    <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-5 lg:sticky lg:top-24"><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-orange-500">On this page</p><nav className="space-y-1">{page.sections.map((section, index) => <a key={section.id} href={`#${section.id}`} className="flex gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-600 transition hover:bg-orange-50 hover:text-orange-700"><span className="font-bold text-orange-400">{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav></aside>
    <div className="space-y-5">{page.sections.map((section, index) => <article id={section.id} key={section.id} className="scroll-mt-28 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8"><div className="mb-5 flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 font-bold text-white">{index + 1}</span><h2 className="pt-1 text-xl font-bold sm:text-2xl">{section.title}</h2></div><div className="legal-copy text-[15px] leading-7 text-stone-600 sm:text-base" dangerouslySetInnerHTML={{ __html: section.body }} /></article>)}</div>
  </div></section>;
}
