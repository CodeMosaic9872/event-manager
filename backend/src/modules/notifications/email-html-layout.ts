/**
 * Minimal responsive wrapper for transactional notification emails.
 * Inner HTML should use inline styles for consistent rendering in clients.
 */
export function notificationEmailShell(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Event Marketplace</title>
</head>
<body style="margin:0;background:#f4f4f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr><td>${innerHtml}</td></tr>
          <tr><td style="padding-top:24px;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7;margin-top:20px;">Event Marketplace</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Single paragraph block with consistent typography (placeholders OK inside). */
export function emailP(textWithPlaceholders: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">${textWithPlaceholders}</p>`;
}

export function emailH1(titleWithPlaceholders: string): string {
  return `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">${titleWithPlaceholders}</h1>`;
}
