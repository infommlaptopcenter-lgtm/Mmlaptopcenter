type EmailOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: unknown;
  total: number;
  paymentMethod: string;
  orderStatus: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendOrderConfirmationEmail(order: EmailOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Confirmation email is not configured. Set RESEND_API_KEY and ORDER_EMAIL_FROM.");
  const items = Array.isArray(order.items) ? order.items as Array<{ title?: unknown; quantity?: unknown; price?: unknown }> : [];
  const itemHtml = items.map((item) => `<li>${escapeHtml(String(item.title ?? "Item"))} &times; ${Number(item.quantity ?? 1)} — PKR ${Number(item.price ?? 0).toLocaleString()}</li>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [order.customerEmail],
      subject: `Order ${order.orderNumber} confirmed`,
      html: `<h2>Assalam-o-Alaikum ${escapeHtml(order.customerName)},</h2><p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been confirmed.</p><ul>${itemHtml}</ul><p><strong>Total:</strong> PKR ${order.total.toLocaleString()}</p><p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod.replaceAll("_", " "))}</p><p><strong>Status:</strong> ${escapeHtml(order.orderStatus)}</p><p>Thank you for choosing MM Laptop Center.</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Confirmation email failed (${response.status}).`);
}
