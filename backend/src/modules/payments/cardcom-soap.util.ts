/** Escape text for SOAP/XML element bodies. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Extract first matching `<tag>...</tag>` inner text (case-insensitive tag name). */
export function getXmlInnerText(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const m = xml.match(re);
  const v = m?.[1]?.trim();
  return v && v.length > 0 ? v : null;
}

/** Extract block between first `<tag` ... `>` and matching `</tag>`. */
export function getXmlBlock(xml: string, tag: string): string | null {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'i');
  const open = xml.match(openRe);
  if (!open || open.index === undefined) return null;
  const start = open.index + open[0].length;
  const closeRe = new RegExp(`</${tag}>`, 'i');
  const rest = xml.slice(start);
  const close = closeRe.exec(rest);
  if (!close) return null;
  return rest.slice(0, close.index);
}

export function parseIntSafe(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}
