export type PaymentMethod = "cod" | "manual_transfer";

export type CheckoutDetails = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

export const COD_LIMIT = 100_000;

export const paymentAccounts = [
  { name: "Easypaisa", title: process.env.NEXT_PUBLIC_EASYPAISA_TITLE || "MM Laptop Center", number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || "Contact us for account number" },
  { name: "Bank Transfer", title: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || "MM Laptop Center", number: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "Contact us for account details", detail: process.env.NEXT_PUBLIC_BANK_NAME || "Bank account" },
];
