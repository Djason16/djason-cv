// Shared theme tokens used across all email templates
const theme = {
  colorTextPrimary: '#1a1d1f',
  colorTextSecondary: '#1a1d1f',
  colorHighlight: '#2e9e5e',
  colorHighlightDeco: '#58D68D',
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
    <div style="font-family:'Courier New',monospace;font-weight:700;font-size:2.25rem;color:${theme.colorHighlight};letter-spacing:0.35em;user-select:all;">${value}</div>
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

// Temporary password email — sent to admin after security answer verification
export const renderTempPasswordEmail = ({ userEmail, tempPassword, message = '', adminName = 'Admin', locale = 'fr', config }) => {
  const TEXT = {
    fr: {
      title: 'Mot de passe temporaire',
      instruction: "N'oublie pas de le changer après ta connexion.",
      userLabel: 'Ton compte :',
      tempPasswordLabel: 'Mot de passe temporaire',
      regards: 'À bientôt',
      siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`
    },
    en: {
      title: 'Temporary password',
      instruction: 'Remember to change it after logging in.',
      userLabel: 'Your account:',
      tempPasswordLabel: 'Temporary password',
      regards: 'Cheers',
      siteNote: `Sent from my site ${config.public.frontendDomain}`
    }
  }

  const t = TEXT[locale] || TEXT.fr

  return renderEmailBody({
    title: t.title,
    subtitle: message || `<strong style="font-size:1rem;display:inline;">${t.userLabel}</strong> ${userEmail}`,
    label: t.tempPasswordLabel,
    value: tempPassword,
    instruction: t.instruction,
    regards: t.regards,
    adminName,
    siteNote: t.siteNote,
    locale
  })
}

// OTP email — sent to user after successful credential verification
export const renderOtpEmail = ({ code, adminName = 'Admin', locale = 'fr', config }) => {
  const TEXT = {
    fr: {
      title: 'Code de connexion',
      instruction: 'Ce code expire dans 10 minutes. Ne le partagez pas.',
      codeLabel: 'Code OTP',
      regards: 'À bientôt',
      siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`
    },
    en: {
      title: 'Login code',
      instruction: 'This code expires in 10 minutes. Do not share it.',
      codeLabel: 'OTP Code',
      regards: 'Cheers',
      siteNote: `Sent from my site ${config.public.frontendDomain}`
    }
  }

  const t = TEXT[locale] || TEXT.fr

  return renderEmailBody({
    title: t.title,
    label: t.codeLabel,
    value: code,
    instruction: t.instruction,
    regards: t.regards,
    adminName,
    siteNote: t.siteNote,
    locale
  })
}