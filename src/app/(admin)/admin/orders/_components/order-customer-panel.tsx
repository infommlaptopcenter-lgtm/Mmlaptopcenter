import { FaWhatsapp } from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { isValidWhatsAppNumber } from "@/lib/whatsapp";
import type { OrderDetail } from "./types";

export function OrderCustomerPanel({
  order, sendingWhatsApp, sendingEmail, openCustomerWhatsApp, sendOrderConfirmation, sendConfirmationEmail,
}: {
  order: OrderDetail;
  sendingWhatsApp: boolean;
  sendingEmail: boolean;
  openCustomerWhatsApp: () => void;
  sendOrderConfirmation: () => void;
  sendConfirmationEmail: () => void;
}) {
  const address = order.customerAddress ?? {};
  const hasValidWhatsApp = order.customerPhone && isValidWhatsAppNumber(order.customerPhone);
  return (
    <div className="rounded-xl border border-[#d8a928]/20 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#c86f2d]">Contact & delivery</p><h2 className="mt-1 text-base font-bold text-[#0a0a0a]">Customer details</h2>
      <div className="mt-4 space-y-2 text-sm text-[#5A5E55]">
        <div className="flex items-center gap-2 font-medium text-[#0a0a0a]"><FiUser className="text-[#c86f2d]" />{order.customerName}</div>
        <div className="flex items-center gap-2"><FiMail className="text-[#c86f2d]" />{order.customerEmail || "Email not provided"}</div>
        {order.customerPhone ? <PhoneLine phone={order.customerPhone} valid={!!hasValidWhatsApp} /> : <div className="text-xs text-red-500">No phone number provided</div>}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{hasValidWhatsApp ? <WhatsAppButtons sending={sendingWhatsApp} onChat={openCustomerWhatsApp} onConfirm={sendOrderConfirmation} /> : null}<button onClick={sendConfirmationEmail} disabled={sendingEmail || !order.customerEmail} title={!order.customerEmail ? "Customer did not provide an email" : undefined} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#f6a45d] px-3 py-2 text-xs font-bold text-white hover:bg-[#d8861f] disabled:cursor-not-allowed disabled:opacity-40"><FiMail />{sendingEmail ? "Sending..." : order.confirmationEmailSentAt ? "Resend email" : "Send email"}</button></div>
      <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]"><FiMapPin className="text-[#c86f2d]" />Delivery address</h3>
      <div className="mt-2 rounded-lg bg-[#fcf5e8] p-3 text-sm leading-6 text-[#5A5E55]">{[address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ")}</div>
    </div>
  );
}

function PhoneLine({ phone, valid }: { phone: string; valid: boolean }) {
  return <div className="flex flex-wrap items-center gap-2"><FiPhone className="text-[#c86f2d]" /><span>{phone}</span>{valid && <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Valid WhatsApp format</span>}</div>;
}

function WhatsAppButtons({ sending, onChat, onConfirm }: { sending: boolean; onChat: () => void; onConfirm: () => void }) {
  return (
    <>
      <button onClick={onChat} className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-[#25D366] px-2 py-2 text-[11px] font-semibold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white sm:px-3 sm:text-xs"><FaWhatsapp className="h-3.5 w-3.5 shrink-0" /><span>WhatsApp Chat</span></button>
      <button onClick={onConfirm} disabled={sending} className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#25D366] px-2 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#128C7E] disabled:opacity-50 sm:px-3 sm:text-xs"><FaWhatsapp className="h-3.5 w-3.5 shrink-0" /><span>{sending ? "Opening..." : "Send Confirmation"}</span></button>
    </>
  );
}
