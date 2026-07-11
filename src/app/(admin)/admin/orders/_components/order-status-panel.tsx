type OrderStatusForm = {
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string;
  trackingUrl: string;
  notes: string;
};

export function OrderStatusPanel({
  form, setForm, saving, save,
}: {
  form: OrderStatusForm;
  setForm: React.Dispatch<React.SetStateAction<OrderStatusForm>>;
  saving: boolean;
  save: () => Promise<void>;
}) {
  const proofUrl = form.notes.match(/PAYMENT PROOF: (https?:\/\/\S+)/)?.[1];
  const reference = form.notes.match(/PAYMENT REFERENCE: ([^\n]+)/)?.[1];
  return (
    <div className="rounded-xl border border-[#d8a928]/20 bg-white p-6">
      <h2 className="text-sm font-semibold text-[#0a0a0a]">Status</h2>
      <div className="mt-4 grid gap-4">
        <Select label="Order status" value={form.orderStatus} onChange={(value) => setForm((f) => ({ ...f, orderStatus: value }))} options={["pending", "processing", "completed", "cancelled", "shipped", "delivered"]} />
        <Select label="Payment status" value={form.paymentStatus} onChange={(value) => setForm((f) => ({ ...f, paymentStatus: value }))} options={["pending", "paid", "failed", "refunded"]} />
        <Input label="Tracking #" value={form.trackingNumber} onChange={(value) => setForm((f) => ({ ...f, trackingNumber: value }))} />
        <Input label="Tracking URL" value={form.trackingUrl} onChange={(value) => setForm((f) => ({ ...f, trackingUrl: value }))} />
        {proofUrl ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><p className="font-semibold text-[#0a0a0a]">Manual payment awaiting verification</p>{reference ? <p className="mt-1 text-xs text-[#5A5E55]">Reference: {reference}</p> : null}<a href={proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-blue-700 underline">View transaction screenshot</a></div> : null}
        <label className="block text-sm font-medium text-[#0a0a0a]">Notes<textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#d8a928]" /></label>
        <button onClick={save} disabled={saving} className="rounded-lg bg-[#f6a45d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d8861f] disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block text-sm font-medium text-[#0a0a0a]">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#d8a928]">{options.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select></label>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium text-[#0a0a0a]">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#d8a928]" /></label>;
}
