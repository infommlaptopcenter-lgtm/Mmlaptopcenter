"use client";

import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiFileText, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import type { LegalPageData, LegalPageSlug } from "@/lib/legal-pages";

const tabs: { slug: LegalPageSlug; label: string }[] = [
  { slug: "faq", label: "FAQs" }, { slug: "privacy", label: "Privacy" }, { slug: "terms", label: "Terms" }, { slug: "refund-policy", label: "Refunds" },
];

export default function LegalPagesAdmin() {
  const [pages, setPages] = useState<Record<LegalPageSlug, LegalPageData> | null>(null);
  const [active, setActive] = useState<LegalPageSlug>("faq");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void fetch("/api/admin/legal-pages").then((r) => r.json()).then((data) => setPages(data.pages)); }, []);
  if (!pages) return <div className="p-6 text-stone-600">Loading legal pages...</div>;
  const page = pages[active];
  const update = (changes: Partial<LegalPageData>) => setPages((current) => current ? ({ ...current, [active]: { ...current[active], ...changes } }) : current);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/legal-pages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(page) });
      const data = await response.json();
      setMessage(response.ok ? "Page saved successfully. Changes are now live." : data.error || "Could not save page.");
    } catch { setMessage("Could not save page. Please try again."); } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-6xl py-6 sm:py-10">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d97706]">Content management</p><h1 className="mt-1 text-2xl font-black text-[#17130d] sm:text-3xl">Legal pages</h1><p className="mt-2 max-w-2xl text-sm text-stone-600">Manage policy copy, page heroes, update dates, and FAQs. Static trust signals and responsive design are protected by the site template.</p></div><a href={`/${active}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#d97706] hover:underline">Preview live page ↗</a></div>
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <button key={tab.slug} onClick={() => { setActive(tab.slug); setMessage(""); }} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold ${active === tab.slug ? "bg-[#1a1308] text-white" : "border border-[#d8a928]/25 bg-white text-stone-600"}`}>{tab.label}</button>)}</div>
    {message && <div className={`mb-5 rounded-xl border p-4 text-sm ${message.includes("successfully") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message}</div>}
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Panel title="Hero content" description="Use a short heading; highlighted text appears in orange.">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Eyebrow" value={page.eyebrow} onChange={(eyebrow) => update({ eyebrow })} /><Field label="Last updated" value={page.lastUpdated} onChange={(lastUpdated) => update({ lastUpdated })} /><Field label="Main heading" value={page.title} onChange={(title) => update({ title })} /><Field label="Orange highlighted text" value={page.titleHighlight} onChange={(titleHighlight) => update({ titleHighlight })} /></div>
          <TextArea label="Hero description" value={page.description} rows={3} onChange={(description) => update({ description })} />
          <Field label="Background image path or URL" value={page.heroImage} onChange={(heroImage) => update({ heroImage })} hint="Displayed at low opacity behind the hero text." />
        </Panel>
        {active === "faq" ? <FaqEditor page={page} update={update} /> : <SectionEditor page={page} update={update} />}
      </div>
      <aside className="h-fit rounded-2xl border border-[#d8a928]/20 bg-white p-5 shadow-sm lg:sticky lg:top-24"><FiFileText className="h-6 w-6 text-[#d97706]" /><h2 className="mt-3 font-bold">Publishing checklist</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600"><li>• Keep language simple and accurate.</li><li>• Update the date after policy changes.</li><li>• Confirm timeframes and warranty details.</li><li>• Preview on mobile before sharing.</li></ul><button onClick={save} disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d97706] px-5 py-3 font-bold text-white hover:bg-[#b86205] disabled:opacity-60"><FiSave />{saving ? "Saving..." : "Save & publish"}</button></aside>
    </div>
  </div>;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#d8a928]/20 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-lg font-bold">{title}</h2><p className="mb-5 mt-1 text-sm text-stone-500">{description}</p><div className="space-y-4">{children}</div></section>; }
function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) { return <label className="block text-sm font-semibold text-stone-700">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#fffdfa] px-3 py-2.5 font-normal outline-none focus:border-[#d97706] focus:ring-2 focus:ring-orange-100" />{hint && <span className="mt-1 block text-xs font-normal text-stone-400">{hint}</span>}</label>; }
function TextArea({ label, value, onChange, rows = 5, hint }: { label: string; value: string; onChange: (value: string) => void; rows?: number; hint?: string }) { return <label className="block text-sm font-semibold text-stone-700">{label}<textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#fffdfa] px-3 py-2.5 font-normal leading-6 outline-none focus:border-[#d97706] focus:ring-2 focus:ring-orange-100" />{hint && <span className="mt-1 block text-xs font-normal text-stone-400">{hint}</span>}</label>; }

function FaqEditor({ page, update }: { page: LegalPageData; update: (changes: Partial<LegalPageData>) => void }) {
  const items = page.faqs ?? [];
  const change = (index: number, key: "question" | "answer", value: string) => update({ faqs: items.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  return <Panel title="Questions and answers" description="Add, edit, remove, or reorder the questions shown on the FAQ page.">{items.map((item, index) => <div key={item.id} className="rounded-xl border border-stone-200 bg-[#fffdfa] p-4"><div className="mb-3 flex items-center justify-between"><strong className="text-sm text-[#d97706]">Question {index + 1}</strong><EditorActions index={index} total={items.length} move={(to) => { const next = [...items]; [next[index], next[to]] = [next[to], next[index]]; update({ faqs: next }); }} remove={() => update({ faqs: items.filter((_, i) => i !== index) })} /></div><Field label="Question" value={item.question} onChange={(value) => change(index, "question", value)} /><div className="mt-3"><TextArea label="Answer" value={item.answer} rows={4} onChange={(value) => change(index, "answer", value)} /></div></div>)}<button onClick={() => update({ faqs: [...items, { id: `faq-${Date.now()}`, question: "New question", answer: "Add a clear answer here." }] })} className="flex items-center gap-2 rounded-xl border border-dashed border-[#d97706] px-4 py-3 text-sm font-bold text-[#d97706]"><FiPlus />Add FAQ</button></Panel>;
}

function SectionEditor({ page, update }: { page: LegalPageData; update: (changes: Partial<LegalPageData>) => void }) {
  const items = page.sections;
  const change = (index: number, key: "title" | "body", value: string) => update({ sections: items.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  return <Panel title="Policy sections" description="Simple HTML is supported in section content: p, strong, em, ul, ol, li, and links.">{items.map((item, index) => <div key={item.id} className="rounded-xl border border-stone-200 bg-[#fffdfa] p-4"><div className="mb-3 flex items-center justify-between"><strong className="text-sm text-[#d97706]">Section {index + 1}</strong><EditorActions index={index} total={items.length} move={(to) => { const next = [...items]; [next[index], next[to]] = [next[to], next[index]]; update({ sections: next }); }} remove={() => update({ sections: items.filter((_, i) => i !== index) })} /></div><Field label="Heading" value={item.title} onChange={(value) => change(index, "title", value)} /><div className="mt-3"><TextArea label="Content" value={item.body} rows={6} hint="Use <p> for paragraphs and <ul><li> for lists." onChange={(value) => change(index, "body", value)} /></div></div>)}<button onClick={() => update({ sections: [...items, { id: `section-${Date.now()}`, title: "New section", body: "<p>Add policy details here.</p>" }] })} className="flex items-center gap-2 rounded-xl border border-dashed border-[#d97706] px-4 py-3 text-sm font-bold text-[#d97706]"><FiPlus />Add section</button></Panel>;
}

function EditorActions({ index, total, move, remove }: { index: number; total: number; move: (to: number) => void; remove: () => void }) { return <div className="flex gap-1"><button aria-label="Move up" disabled={index === 0} onClick={() => move(index - 1)} className="rounded-lg p-2 hover:bg-stone-100 disabled:opacity-25"><FiArrowUp /></button><button aria-label="Move down" disabled={index === total - 1} onClick={() => move(index + 1)} className="rounded-lg p-2 hover:bg-stone-100 disabled:opacity-25"><FiArrowDown /></button><button aria-label="Delete" onClick={remove} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><FiTrash2 /></button></div>; }
