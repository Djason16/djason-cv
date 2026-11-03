import { MailTitles } from './MailTitles.js'

/*
 * Look shared by every email (MailTemplates.js, WithdrawalMails.js, AutopayMails.js), the one of the site:
 * its ink, light texts, mint labels in small spaced capitals, Archivo titles (Barlow Condensed for the texts), thin rules,
 * no rounded corners. The colors are also written on the tables (bgcolor): the email clients that drop the styles keep them.
 *   MailLayout.shell({ title, locale, body })   the frame: the bar with the logo, the content, the bottom bar
 *   MailLayout.body({ title, subtitle, label, value, instruction, button, regards, adminName, siteNote, locale })   a short email
 *     button (optional): { href, label }, a mint button under the text (a payment link...)
 */

// Colors and spacing of the site (assets/css/utils/variables.css)
const theme = {
    colorTextPrimary: '#eef1f3',
    colorTextSecondary: '#d6dce0',
    colorHighlight: '#7ee6a8',
    colorHighlightDeco: '#7ee6a8',
    colorWarning: '#ffb4a8',
    bgWarning: '#221a1a',
    borderWarning: '#e74c3c',
    bgBody: '#0b0d0f',
    bgContainer: '#111417',
    bgSoft: '#1b1d21',
    bgDark: '#111417',
    bgSlate: '#0b0d0f',
    borderContainer: 'rgba(255,255,255,0.1)',
    colorTextFooter: '#a4b0b8',
    colorTextSiteNote: '#a4b0b8',
    // Gmail and Outlook never load the fonts of the site: condensed / heavy fonts every computer and phone has take their place
    fontFamily: "'Barlow Condensed', 'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif",
    fontDisplay: "'Archivo', 'Arial Black', 'Helvetica Neue', Arial, sans-serif",
    spacing: '1rem',
    padding: '2rem'
}

// Styles of every email
const baseStyles = (t) => `
  body, table, td, a, p, h1, strong, span {
    margin:0; padding:0; font-family:${t.fontFamily}; line-height:1.55; color:${t.colorTextPrimary};
  }
  body { width:100% !important; background:${t.bgBody}; }
  table { border-spacing:0; width:100%; }
  a { color:${t.colorHighlight}; text-decoration:none; }
  .email-wrapper { background:${t.bgContainer}; max-width:600px; margin:${t.spacing} auto; }
  .email-brand { background:${t.bgContainer}; padding:1.5rem ${t.padding}; border-bottom:1px solid ${t.borderContainer}; }
  .email-brand img { height:34px; width:auto; border:0; display:block; }
  .email-content { padding:2.25rem ${t.padding} ${t.padding}; }
  .email-header { margin-bottom:1.5rem; }
  .eyebrow {
    font-size:0.75rem; font-weight:600; letter-spacing:0.26em; text-transform:uppercase; color:${t.colorHighlight}; margin-bottom:0.6rem;
  }
  h1 {
    font-family:${t.fontDisplay}; font-stretch:125%; font-weight:600; font-size:1.75rem; line-height:1.05;
    text-transform:uppercase; letter-spacing:0.01em; color:${t.colorTextPrimary}; margin:0;
  }
  .divider { width:48px; height:2px; background:${t.colorHighlightDeco}; margin:1rem 0 0; }
  p, .instruction, .site-note { font-weight:400; font-size:1.05rem; color:${t.colorTextSecondary}; }
  strong { font-weight:600; color:${t.colorHighlight}; display:inline; }
  .label {
    font-size:0.75rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:${t.colorTextFooter}; margin-bottom:0.6rem;
  }
  .code-wrapper { background:${t.bgSoft}; border-left:2px solid ${t.colorHighlightDeco}; padding:1.4rem 1.5rem; margin:0 0 ${t.spacing} 0; }
  .instruction {
    border-top:1px solid ${t.borderContainer}; padding:1rem 0 0; font-size:1.02rem; color:${t.colorTextSecondary}; margin-bottom:${t.spacing};
  }
  .footer { font-size:0.95rem; color:${t.colorTextFooter}; padding-top:1.25rem; margin-top:1.5rem; border-top:1px solid ${t.borderContainer}; }
  .email-bottom { background:${t.bgSlate}; padding:1rem ${t.padding}; border-top:1px solid ${t.borderContainer}; }
  .email-bottom a { color:${t.colorTextFooter}; font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; }
  .email-bottom .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:${t.colorHighlightDeco}; margin-right:8px; }
  .site-note { color:${t.colorTextSiteNote}; font-size:0.85rem; }
  .schedule-table td { padding:0.65rem 0; border-bottom:1px solid ${t.borderContainer}; }
  .schedule-day { font-weight:600; color:${t.colorTextPrimary}; }
  .schedule-hours { text-align:right; color:${t.colorHighlight}; }
  .schedule-closed { text-align:right; color:${t.colorTextSiteNote}; }
  .unavailable-banner { background:${t.bgWarning}; border-left:2px solid ${t.borderWarning}; padding:1.1rem 1.25rem; margin-bottom:${t.spacing}; }
  .unavailable-icon { display:inline-block; width:28px; height:28px; line-height:28px; text-align:center; background:${t.borderWarning}; color:#fff; font-weight:700; font-size:0.95rem; margin-bottom:0.6rem; }
  .unavailable-title { font-size:0.75rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:${t.colorWarning}; margin-bottom:0.6rem; }
  .unavailable-dates { font-size:1.1rem; font-weight:600; color:${t.colorTextPrimary}; margin-bottom:0.25rem; }
  .unavailable-dates:last-of-type { margin-bottom:0; }
  .unavailable-note { font-size:0.9rem; color:${t.colorTextFooter}; margin-top:0.75rem; }
`

// The logo is read by the email client of the reader, from the Internet: the site online, even for an email sent locally
const PUBLIC_SITE = 'https://djason-chery.dev'
const publicSite = site => String(site || '').startsWith('https://') ? site.replace(/\/$/, '') : PUBLIC_SITE

// The email clients drop the colors of the styles on the links (Gmail paints them blue) and link the addresses written as text:
// every link gets its color written on it, every address of the text (a web address, an email address) becomes such a link.
// A title drawn in the font of the site (MailTitles.js, scripts/mail-titles.mjs) is shown as its image (put in the email: MailHelper), its text as the alternative;
// another title keeps its text, with the font written on it
const LINK = `color:${theme.colorHighlight};text-decoration:none;`
const titleImage = (text, site) => {
    const image = MailTitles[text]
    return image ? `<h1 style="margin:0;font-size:0;line-height:0;"><img src="cid:title-${image.file}" alt="${text}" width="${image.width}" height="${image.height}" style="display:block;border:0;width:${image.width}px;max-width:100%;height:auto;color:${theme.colorTextPrimary};font-family:${theme.fontDisplay};font-size:24px;font-weight:700;text-transform:uppercase;"/></h1>` : null
}
const inline = (html, site) => html
    .replace(/<h1>([^<]*)<\/h1>/g, (m, text) => titleImage(text.trim(), site) || m)
    .replace(/<a href="([^"]*)">/g, `<a style="${LINK}" href="$1">`)
    .replace(/(^|[\s(>])(https?:\/\/[^\s<"]+)/g, (m, before, url) => `${before}<a style="${LINK}" href="${url}">${url}</a>`)
    // An email address written as text (an account, a contact): a mint mailto link, unless it is already the text of a link
    .replace(/(^|[\s(>])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, (m, before, mail, at, all) => {
        const opened = all.lastIndexOf('<a', at), closed = all.lastIndexOf('</a>', at)
        return opened > closed ? m : `${before}<a style="${LINK}" href="mailto:${mail}">${mail}</a>`
    })
    .replace(/<h1>/g, `<h1 style="font-family:${theme.fontDisplay};font-stretch:125%;font-weight:600;text-transform:uppercase;color:${theme.colorTextPrimary};">`)

// The frame of every email: the bar with the logo, the content, then the bar with the address of the site
const emailShell = ({ title, locale, body, site = useRuntimeConfig().public.frontendDomain }) => inline(`
<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,600&family=Barlow+Condensed:wght@400;600&display=swap" rel="stylesheet"/>
<style>${baseStyles(theme)}</style>
</head>
<body bgcolor="${theme.bgBody}" style="background:${theme.bgBody};">
<center>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="${theme.bgBody}" style="background:${theme.bgBody}; padding:${theme.spacing} 0;">
  <tr>
    <td align="center" valign="top">
      <table role="presentation" class="email-wrapper" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.bgContainer}" style="background:${theme.bgContainer};">
        <tr><td class="email-brand" bgcolor="${theme.bgContainer}"><img src="${publicSite(site)}/images/main_logo_light.png" alt="Djason Chery" width="122" height="34" style="display:block;border:0;height:34px;width:auto;"/></td></tr>
        <tr><td class="email-content" bgcolor="${theme.bgContainer}" style="font-family:${theme.fontFamily};color:${theme.colorTextSecondary};">${body}</td></tr>
        <tr><td class="email-bottom" bgcolor="${theme.bgSlate}" style="font-family:${theme.fontFamily};"><span class="dot"></span><a style="color:${theme.colorTextFooter};font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;text-decoration:none;" href="${site}">${site.replace(/^https?:\/\//, '')}</a></td></tr>
      </table>
    </td>
  </tr>
</table>
</center>
</body>
</html>
`, publicSite(site))

// The value of a short email (a code, an amount, a number), large, in mint, on a panel with a mint line
const codeBlock = (value) =>
  `<div class="code-wrapper">
    <div style="font-family:${theme.fontDisplay};font-stretch:125%;font-weight:600;font-size:clamp(1.5rem,6vw,2.1rem);color:${theme.colorHighlightDeco};letter-spacing:0.08em;word-break:break-all;user-select:all;">${value}</div>
  </div>`

// A short email (login code, temporary password, receipt...): a mint label, the title, the value, the text, the signature
const renderEmailBody = ({ title, subtitle = '', label, value, instruction, button = null, regards, adminName, siteNote, locale }) =>
  emailShell({
    title,
    locale,
    body: `
      <div class="email-header">
        ${label ? `<p class="eyebrow">${label}</p>` : ''}
        <h1>${title}</h1>
        <div class="divider"></div>
      </div>
      ${subtitle ? `<p style="font-size:1.05rem;color:${theme.colorTextFooter};margin-bottom:${theme.spacing};">${subtitle}</p>` : ''}
      ${codeBlock(value)}
      <p class="instruction">${instruction}</p>
      ${button ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:auto;margin:0.5rem 0 ${theme.spacing};"><tr><td bgcolor="${theme.colorHighlightDeco}" style="background:${theme.colorHighlightDeco};"><a href="${button.href}" style="display:inline-block;padding:0.85rem 1.6rem;color:#111417;font-weight:600;font-size:0.9rem;letter-spacing:0.22em;text-transform:uppercase;">${button.label}</a></td></tr></table>` : ''}
      <div class="footer">
        <p style="font-size:0.95rem;margin-bottom:0.25rem;color:${theme.colorTextFooter};">${regards},<br/><strong style="font-size:0.95rem;color:${theme.colorTextPrimary};">${adminName}</strong></p>
        ${siteNote ? `<p style="margin-top:0.75rem;" class="site-note">${siteNote}</p>` : ''}
      </div>
    `
  })

export const MailLayout = { theme, shell: emailShell, codeBlock, body: renderEmailBody }
