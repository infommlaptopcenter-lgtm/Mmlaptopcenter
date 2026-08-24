import nodemailer from "nodemailer";

type EmailOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerAddress: unknown;
  items: unknown;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  courierName?: string | null;
  estimatedDelivery?: Date | null;
  notes?: string | null;
  customerPhone?: string | null;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  paymentProofUrl?: string | null;
  transactionReference?: string | null;
  createdAt?: Date;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export function gmailTransport() {
  const user = (process.env.GMAIL_USER || process.env.ADMIN_EMAIL || process.env.ADMIN_USER)?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.trim().replace(/^['"]|['"]$/g, "").replaceAll(" ", "");
  if (!user || !user.includes("@") || !appPassword) {
    throw new Error("Gmail email is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env, then restart the server.");
  }
  return { user, transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass: appPassword } }) };
}

export async function sendAdminPasswordResetEmail(email: string, otp: string) {
  const { user, transporter } = gmailTransport();
  await transporter.sendMail({
    from: `MM Laptop Center <${user}>`,
    to: email,
    replyTo: user,
    subject: "Your MM Laptop Center password reset code",
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1308"><h1 style="background:#1a1308;color:#d8a928;padding:18px">Password reset</h1><div style="padding:24px;border:1px solid #eee"><p>Use this one-time code to reset your admin password:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center">${otp}</p><p>This code expires in 10 minutes and can only be used once.</p></div></div>`,
  });
}

export async function sendOrderConfirmationEmail(order: EmailOrder) {
  if (!order.customerEmail) throw new Error("This customer did not provide an email address.");
  const { user, transporter } = gmailTransport();
  const items = Array.isArray(order.items) ? order.items as Array<{ title?: unknown; quantity?: unknown; price?: unknown }> : [];
  const address = order.customerAddress && typeof order.customerAddress === "object" ? order.customerAddress as Record<string, unknown> : {};
  const addressText = [address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean).map(String).join(", ");
  const itemHtml = items.map((item) => `<li style="margin-bottom:8px">${escapeHtml(String(item.title ?? "Item"))} &times; ${Number(item.quantity ?? 1)} — PKR ${(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString()}</li>`).join("");

  const fulfillmentHtml = order.trackingNumber
    ? `<h3>Delivery tracking</h3><p><strong>Courier:</strong> ${escapeHtml(order.courierName || "Delivery partner")}<br><strong>Tracking ID:</strong> ${escapeHtml(order.trackingNumber)}${order.estimatedDelivery ? `<br><strong>Estimated delivery:</strong> ${escapeHtml(order.estimatedDelivery.toLocaleDateString("en-PK"))}` : ""}${order.trackingUrl ? `<br><a href="${escapeHtml(order.trackingUrl)}">Track your shipment</a>` : ""}</p>`
    : "";
  const notesHtml = order.notes
    ? `<h3>Additional information</h3><p>${escapeHtml(order.notes)}</p>`
    : "";

  await transporter.sendMail({
    from: `MM Laptop Center <${user}>`,
    to: order.customerEmail,
    replyTo: user,
    subject: `Order ${order.orderNumber} update`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#1a1308"><div style="background:#f6a45d;padding:20px;color:white"><h1 style="margin:0;font-size:24px">Order update</h1></div><div style="padding:24px;border:1px solid #eee"><p>Assalam-o-Alaikum ${escapeHtml(order.customerName)},</p><p>Here are the latest details for order <strong>${escapeHtml(order.orderNumber)}</strong>.</p><h3>Products</h3><ul>${itemHtml}</ul><p><strong>Total:</strong> PKR ${order.total.toLocaleString()}</p><p><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod.replaceAll("_", " "))}</p><p><strong>Payment status:</strong> ${escapeHtml(order.paymentStatus)}</p><p><strong>Order status:</strong> ${escapeHtml(order.orderStatus)}</p><p><strong>Delivery address:</strong><br>${escapeHtml(addressText || "Not provided")}</p>${fulfillmentHtml}${notesHtml}<p>Thank you for choosing MM Laptop Center.</p></div></div>`,
  });
}

export async function sendAdminNewOrderEmail(order: EmailOrder) {
  const { user, transporter } = gmailTransport();
  const adminEmail = (process.env.ADMIN_EMAIL || user).trim();
  const items = Array.isArray(order.items) ? order.items as Array<{ title?: unknown; quantity?: unknown; price?: unknown }> : [];
  const address = order.customerAddress && typeof order.customerAddress === "object" ? order.customerAddress as Record<string, unknown> : {};
  const addressText = [address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean).map(String).join(", ");
  const itemRows = items.map((item) => {
    const quantity = Number(item.quantity ?? 1);
    const price = Number(item.price ?? 0);
    return `<tr><td style="padding:8px;border:1px solid #ddd">${escapeHtml(String(item.title ?? "Item"))}</td><td style="padding:8px;border:1px solid #ddd">${quantity}</td><td style="padding:8px;border:1px solid #ddd">PKR ${price.toLocaleString()}</td><td style="padding:8px;border:1px solid #ddd">PKR ${(price * quantity).toLocaleString()}</td></tr>`;
  }).join("");
  const proof = order.paymentProofUrl ? `<p><strong>Payment proof:</strong> <a href="${escapeHtml(order.paymentProofUrl)}">View screenshot</a></p>` : "";

  await transporter.sendMail({
    from: `MM Laptop Center <${user}>`,
    to: adminEmail,
    replyTo: order.customerEmail || undefined,
    subject: `New order received: ${order.orderNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#1a1308"><h1 style="background:#1a1308;color:#d8a928;padding:18px">New order received</h1><p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}<br><strong>Received:</strong> ${escapeHtml((order.createdAt ?? new Date()).toLocaleString("en-PK"))}</p><h3>Customer</h3><p><strong>Name:</strong> ${escapeHtml(order.customerName)}<br><strong>Email:</strong> ${escapeHtml(order.customerEmail || "Not provided")}<br><strong>Phone:</strong> ${escapeHtml(order.customerPhone || "Not provided")}<br><strong>Address:</strong> ${escapeHtml(addressText || "Not provided")}</p><h3>Items</h3><table style="border-collapse:collapse;width:100%"><thead><tr><th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th><th style="padding:8px;border:1px solid #ddd">Qty</th><th style="padding:8px;border:1px solid #ddd">Price</th><th style="padding:8px;border:1px solid #ddd">Line total</th></tr></thead><tbody>${itemRows}</tbody></table><h3>Payment and totals</h3><p><strong>Subtotal:</strong> PKR ${(order.subtotal ?? order.total).toLocaleString()}<br><strong>Shipping:</strong> PKR ${(order.shippingCost ?? 0).toLocaleString()}<br><strong>Tax:</strong> PKR ${(order.tax ?? 0).toLocaleString()}<br><strong>Discount:</strong> PKR ${(order.discount ?? 0).toLocaleString()}<br><strong>Total:</strong> PKR ${order.total.toLocaleString()}<br><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod.replaceAll("_", " "))}<br><strong>Payment status:</strong> ${escapeHtml(order.paymentStatus)}<br><strong>Transaction reference:</strong> ${escapeHtml(order.transactionReference || "Not provided")}<br><strong>Order status:</strong> ${escapeHtml(order.orderStatus)}</p>${proof}<p><strong>Notes:</strong> ${escapeHtml(order.notes || "None")}</p>`,
  });
}
