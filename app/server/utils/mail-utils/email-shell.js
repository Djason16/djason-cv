// Shared email HTML shell — wraps any inner content block
export const emailShell = ({ title, locale, body }) => `
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
export const codeBlock = (value) =>
  `<div class="code-wrapper">
    <div style="font-family:${theme.fontFamily};font-weight:700;font-size:clamp(1.75rem,7vw,2.5rem);color:${theme.colorHighlight};letter-spacing:0.2em;word-break:break-all;user-select:all;">${value}</div>
  </div>`