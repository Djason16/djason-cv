// Shared email body builder — used by both OTP and temp password emails
export const renderEmailBody = ({ title, subtitle = '', label, value, instruction, regards, adminName, siteNote, locale }) =>
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