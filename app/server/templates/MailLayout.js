/*
 * Look shared by every email of MailTemplates.js: colors, styles, HTML shell, code block and the body
 * of the short emails (title, label, code, instruction, signature).
 */

// Shared theme tokens used across all email templates
const theme = {
    colorTextPrimary: '#1a1d1f',
    colorTextSecondary: '#1a1d1f',
    colorHighlight: '#2e9e5e',
    colorHighlightDeco: '#58D68D',
    colorWarning: '#c2410c',
    bgWarning: '#fff4ec',
    borderWarning: '#f3caa8',
    bgBody: '#C9D6DF',
    bgContainer: '#fff',
    borderContainer: '#dbe6ea',
    colorTextFooter: '#4a5568',
    colorTextSiteNote: '#6b7280',
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
    spacing: '1rem',
    padding: '2rem'
}

// Shared base styles injected into every email
const baseStyles = (t) => `
  body, table, td, a, p, h1, strong, span {
    margin:0; padding:0; font-family:${t.fontFamily}; line-height:1.5; color:${t.colorTextPrimary};
  }
  body { width:100% !important; background:${t.bgBody}; }
  table { border-spacing:0; width:100%; }
  a { color:${t.colorHighlight}; text-decoration:none; }
  .email-wrapper {
    background:${t.bgContainer};
    max-width:580px;
    margin:${t.spacing} auto;
    border:1px solid ${t.borderContainer};
    padding:${t.padding};
    box-shadow:0 2px 8px rgba(0,0,0,0.05);
  }
  .email-header {
    text-align:center;
    padding-bottom:${t.spacing};
    margin-bottom:${t.spacing};
    border-bottom:2px solid ${t.borderContainer};
  }
  h1 {
    font-weight:700;
    font-size:1.75rem;
    color:${t.colorHighlight};
    margin:0;
    letter-spacing:0.05em;
    text-transform:uppercase;
  }
  .divider {
    width:40px;
    height:3px;
    background:${t.colorHighlight};
    margin:0.5rem auto 0;
  }
  p, strong, .instruction, .site-note { font-weight:400; font-size:1rem; color:${t.colorTextSecondary}; }
  strong { font-weight:600; color:${t.colorHighlight}; display:inline; }
  .label {
    font-size:0.75rem;
    font-weight:700;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:${t.colorTextFooter};
    margin-bottom:0.5rem;
  }
  .code-wrapper {
    background:#f7fbf9;
    border:1px solid ${t.borderContainer};
    padding:1.5rem;
    text-align:center;
    margin:0 0 ${t.spacing} 0;
    box-shadow:0 1px 4px rgba(0,0,0,0.05);
  }
  .instruction {
    background:#f7fbf9;
    border-left:3px solid ${t.colorHighlight};
    padding:0.75rem 1rem;
    font-size:0.9rem;
    font-weight:500;
    color:${t.colorTextPrimary};
    box-shadow:0 1px 4px rgba(0,0,0,0.05);
    margin-bottom:${t.spacing};
  }
  .footer {
    font-size:0.9rem;
    color:${t.colorTextFooter};
    text-align:center;
    padding-top:${t.spacing};
    margin-top:${t.spacing};
    border-top:1px solid ${t.borderContainer};
  }
  .site-note { font-style:italic; color:${t.colorTextSiteNote}; font-size:0.8rem; text-align:center; }
  .schedule-table td { padding:0.6rem 0; border-bottom:1px solid ${t.borderContainer}; }
  .schedule-day { font-weight:600; }
  .schedule-hours { text-align:right; color:${t.colorHighlight}; }
  .schedule-closed { text-align:right; color:${t.colorTextSiteNote}; font-style:italic; }
  .unavailable-banner {
    background:${t.bgWarning};
    border:1px solid ${t.borderWarning};
    padding:1.25rem;
    text-align:center;
    margin-bottom:${t.spacing};
  }
  .unavailable-icon {
    display:inline-block;
    width:36px;
    height:36px;
    line-height:36px;
    border-radius:50%;
    background:${t.colorWarning};
    color:#fff;
    font-weight:700;
    font-size:1.1rem;
    margin-bottom:0.6rem;
  }
  .unavailable-title {
    font-size:0.75rem;
    font-weight:700;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:${t.colorWarning};
    margin-bottom:0.75rem;
  }
  .unavailable-dates {
    font-size:1.1rem;
    font-weight:600;
    color:${t.colorTextPrimary};
    margin-bottom:0.25rem;
  }
  .unavailable-dates:last-of-type { margin-bottom:0; }
  .unavailable-note {
    font-size:0.85rem;
    font-style:italic;
    color:${t.colorTextFooter};
    margin-top:0.75rem;
  }
`

// Shared email HTML shell — wraps any inner content block
const emailShell = ({ title, locale, body }) => `
<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>${baseStyles(theme)}</style>
</head>
<body>
<center>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${theme.bgBody}; padding:${theme.spacing} 0;">
  <tr>
    <td align="center" valign="top">
      <table role="presentation" class="email-wrapper" cellspacing="0" cellpadding="0" border="0">
        <tr><td>${body}</td></tr>
      </table>
    </td>
  </tr>
</table>
</center>
</body>
</html>
`

// Shared code block style — prominent and centered
const codeBlock = (value) =>
  `<div class="code-wrapper">
    <div style="font-family:${theme.fontFamily};font-weight:700;font-size:clamp(1.75rem,7vw,2.5rem);color:${theme.colorHighlight};letter-spacing:0.2em;word-break:break-all;user-select:all;">${value}</div>
  </div>`

// Shared email body builder — used by both OTP and temp password emails
const renderEmailBody = ({ title, subtitle = '', label, value, instruction, regards, adminName, siteNote, locale }) =>
  emailShell({
    title,
    locale,
    body: `
      <div class="email-header">
        <h1>${title}</h1>
        <div class="divider"></div>
      </div>
      ${subtitle ? `<p style="text-align:center;font-style:italic;font-size:1rem;margin-bottom:${theme.spacing};">${subtitle}</p>` : ''}
      ${label ? `<p class="label">${label}</p>` : ''}
      ${codeBlock(value)}
      <p class="instruction">${instruction}</p>
      <div class="footer">
        <p style="font-size:0.9rem;margin-bottom:0.25rem;">${regards},<br/><strong style="font-size:0.9rem;color:${theme.colorTextFooter};">${adminName}</strong></p>
        <p style="margin-top:0.75rem;" class="site-note">${siteNote}</p>
      </div>
    `
  })

export const MailLayout = { theme, shell: emailShell, codeBlock, body: renderEmailBody }
