export const renderTempPasswordEmail = ({ userEmail, tempPassword, message = '', adminName = 'Admin', locale = 'fr', config }) => {
  // Theme colors, fonts, and spacing
  const theme = {
    colorTextPrimary: '#1a1d1f',
    colorTextSecondary: '#1a1d1f',
    colorHighlight: '#58D68D',
    bgBody: '#C9D6DF',
    bgContainer: '#fff',
    bgTempPassword: '#fff',
    borderContainer: '#dbe6ea',
    colorTextFooter: '#7f8c8d',
    colorTextSiteNote: '#95a5a6',
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
    fontSizeBase: '1rem',
    fontSizeHeader: '2rem',
    fontSizeTempPassword: '1.1rem',
    fontSizeFooter: '0.9rem',
    fontSizeSiteNote: '0.85rem',
    spacing: '1rem',
    padding: '2rem'
  };

  // Localized text
  const TEXT = {
    fr: {
      title: 'Voici ton mot de passe temporaire',
      instruction: 'N’oublie pas de le changer après ta connexion.',
      userLabel: 'Ton compte : ',
      tempPasswordLabel: 'Mot de passe temporaire : ',
      regards: 'À bientôt',
      siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`
    },
    en: {
      title: 'Here is your temporary password',
      instruction: 'Remember to change it after logging in.',
      userLabel: 'Your account: ',
      tempPasswordLabel: 'Temporary password: ',
      regards: 'Cheers',
      siteNote: `Sent from my site ${config.public.frontendDomain}`
    }
  };

  const t = TEXT[locale] || TEXT.fr;

  // Return full HTML email as a string
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${t.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed&display=swap" rel="stylesheet"/>
<style>
  body, table, td, a, p, h1, strong, span {
    margin:0; padding:0; font-family:${theme.fontFamily}; line-height:1.5; color:${theme.colorTextPrimary};
  }
  body { width:100% !important; background:${theme.bgBody}; }
  table { border-spacing:0; width:100%; }
  a { color:${theme.colorHighlight}; text-decoration:none; }
  .email-wrapper { background:${theme.bgContainer}; max-width:580px; margin:${theme.spacing} auto; border:1px solid ${theme.borderContainer}; padding:${theme.padding}; box-shadow:0 4px 20px rgba(0,0,0,0.15); }
  h1 { font-weight:700; font-size:${theme.fontSizeHeader}; color:${theme.colorHighlight}; margin-bottom:${theme.spacing}; text-align:center; }
  p, strong, .instruction, .site-note { font-weight:400; font-size:${theme.fontSizeBase}; margin-bottom:${theme.spacing}; color:${theme.colorTextSecondary}; }
  strong { font-weight:600; color:${theme.colorHighlight}; display:block; }
  .temp-password { font-family: "Courier New", monospace; font-weight:600; font-size:${theme.fontSizeTempPassword}; color:${theme.colorHighlight}; background:${theme.bgTempPassword}; border:2px solid ${theme.colorHighlight}; padding:0.5rem 1rem; display:inline-block; user-select:all; letter-spacing:0.12em; }
  .instruction { background:#f0f9f6; border-left:5px solid ${theme.colorHighlight}; padding:0.8rem 1rem; font-weight:600; font-size:${theme.fontSizeBase}; color:${theme.colorTextPrimary}; }
  .footer { font-size:${theme.fontSizeFooter}; color:${theme.colorTextFooter}; text-align:center; }
  .site-note { font-style:italic; color:${theme.colorTextSiteNote}; font-size:${theme.fontSizeSiteNote}; margin-bottom:0; }
</style>
</head>
<body>
<center>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${theme.bgBody}; padding:${theme.spacing} 0;">
  <tr>
    <td align="center" valign="top">
      <table role="presentation" class="email-wrapper" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <h1>${t.title}</h1>
            ${message ? `<p style="text-align:center;font-style:italic;">${message}</p>` : ''}
            <p><strong>${t.userLabel}</strong>${userEmail}</p>
            <p><strong>${t.tempPasswordLabel}</strong><span class="temp-password">${tempPassword}</span></p>
            <p class="instruction">${t.instruction}</p>
            <p class="footer">${t.regards},<br/>${adminName}</p>
            <p class="site-note">${t.siteNote}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</center>
</body>
</html>
    `;
};