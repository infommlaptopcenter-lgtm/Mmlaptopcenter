export function titleize(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function invariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Invariant violation");
  }
}
