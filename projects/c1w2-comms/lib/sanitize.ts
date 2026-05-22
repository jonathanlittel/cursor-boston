export function sanitizeText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[\t\r]+/g, " ")
    .replace(/\0/g, "")
    .trim();
}
