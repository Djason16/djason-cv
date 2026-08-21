import { formatDate } from '~/utils/formatDate'

// Agenda email — sent to active clients with the current weekly schedule (frequency may vary, not always Monday)
export const renderAgendaEmail = ({ timezone, schedule, unavailability = [], isCurrentlyUnavailable = false, availabilityStatus = 'available', hasOverride = false, message = '', adminName = 'Admin', locale = 'fr', config }) => {
  const TEXT = {
    fr: {
      title: 'Mon planning de la semaine',
      subtitle: `Fuseau horaire : ${timezone}`,
      // Instruction message — changes depending on the current situation
      // Kept distinct from the banner note above it to avoid repeating the same sentence twice
      instructionAvailable: "Ces horaires peuvent évoluer en cours de semaine, n'hésitez pas à me contacter pour confirmer un rendez-vous.",
      instructionDatedUnavailable: "Pour toute urgence, n'hésitez pas à me laisser un message : je le traiterai en priorité dès mon retour.",
      instructionOverrideUnavailable: "N'hésitez pas à me laisser un message décrivant votre besoin, ça m'aidera à vous répondre plus rapidement.",
      instructionOverrideBusy: "Je reste disponible sur les horaires ci-dessus, mais pensez à me relancer si vous n'avez pas de retour rapidement.",
      regards: 'À bientôt',
      siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`,
      days: { 0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' },
      closed: 'Fermé',
      unavailableIcon: '!',
      busyIcon: '~',
      // Dated unavailability (real absence period, e.g. vacation)
      unavailableTitleDated: "Indisponible cette semaine",
      unavailableRange: (start, end) => `Du ${start} au ${end} inclus`,
      unavailableNoteDated: "Je vous recontacterai dès que possible dès mon retour.",
      // Manual override (point-in-time status only, no dates, no schedule)
      unavailableTitleOverride: "Indisponible pour le moment",
      unavailableNoteOverride: "Je ne suis pas en congés, mais je ne peux pas répondre immédiatement. Je reviens vers vous dès que possible.",
      busyTitle: "Disponibilité réduite pour le moment",
      busyNote: "Je ne suis pas en congés, mais mes délais de réponse peuvent être un peu plus longs que d'habitude."
    },
    en: {
      title: 'My weekly schedule',
      subtitle: `Timezone: ${timezone}`,
      // Instruction message — changes depending on the current situation
      // Kept distinct from the banner note above it to avoid repeating the same sentence twice
      instructionAvailable: 'These hours may change during the week, feel free to reach out to confirm an appointment.',
      instructionDatedUnavailable: "For anything urgent, feel free to leave me a message: I'll prioritize it as soon as I'm back.",
      instructionOverrideUnavailable: "Feel free to leave me a message describing what you need, it'll help me get back to you faster.",
      instructionOverrideBusy: "I'm still available during the hours above, but feel free to follow up if you don't hear back quickly.",
      regards: 'Cheers',
      siteNote: `Sent from my site ${config.public.frontendDomain}`,
      days: { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' },
      closed: 'Closed',
      unavailableIcon: '!',
      busyIcon: '~',
      // Dated unavailability (real absence period, e.g. vacation)
      unavailableTitleDated: "Unavailable this week",
      unavailableRange: (start, end) => `From ${start} to ${end} (inclusive)`,
      unavailableNoteDated: "I'll get back to you as soon as I'm back.",
      // Manual override (point-in-time status only, no dates, no schedule)
      unavailableTitleOverride: "Unavailable right now",
      unavailableNoteOverride: "I'm not away, I just can't reply immediately. I'll get back to you as soon as I can.",
      busyTitle: "Limited availability right now",
      busyNote: "I'm not away, but my response times may be a bit longer than usual."
    }
  }

  const t = TEXT[locale] || TEXT.fr
  const isBusy = availabilityStatus === 'busy'
  const hasDatedUnavailability = unavailability.length > 0

  // Build today's date label — e.g. "Samedi 22 août 2026" / "Saturday, August 22, 2026"
  const localeCode = locale === 'en' ? 'en-US' : 'fr-FR'
  const todayLabel = new Intl.DateTimeFormat(localeCode, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone
  }).format(new Date())
  const todayLabelCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)

  // Resolve the instruction text based on the current situation
  let instruction = t.instructionAvailable
  if (isCurrentlyUnavailable && hasOverride) instruction = t.instructionOverrideUnavailable
  else if (isCurrentlyUnavailable && hasDatedUnavailability) instruction = t.instructionDatedUnavailable
  else if (isBusy) instruction = t.instructionOverrideBusy

  // Build the weekly schedule rows
  const scheduleRows = Object.keys(t.days).map(i => {
    const day = schedule?.[i]
    return `
      <tr>
        <td class="schedule-day">${t.days[i]}</td>
        <td class="${day ? 'schedule-hours' : 'schedule-closed'}">${day ? `${day.start} - ${day.end}` : t.closed}</td>
      </tr>`
  }).join('')

  // The schedule is only hidden for a real "unavailable" status (override or dated absence).
  // "busy" still shows the schedule — you're not away, just slower to respond, so the hours remain useful.
  const hideSchedule = isCurrentlyUnavailable
  const scheduleTable = hideSchedule ? '' : `
    <table role="presentation" class="schedule-table" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:${theme.spacing};">
      ${scheduleRows}
    </table>`

  // Build the "busy" banner — manual override, status only, no dates. Schedule stays visible below it.
  const busyBlock = isBusy ? `
    <div class="unavailable-banner" style="background:#fff9e6;border-color:#f0d78c;">
      <div class="unavailable-icon" style="background:#c99a1f;">${t.busyIcon}</div>
      <p class="unavailable-title" style="color:#c99a1f;">${t.busyTitle}</p>
      <p class="unavailable-note">${t.busyNote}</p>
    </div>` : ''

  // Build unavailability banner — two distinct cases depending on whether it's a dated absence or a status override
  let unavailabilityBlock = ''
  if (isCurrentlyUnavailable && hasOverride) {
    // Override-driven unavailability: status only, no dates, no schedule shown
    unavailabilityBlock = `
    <div class="unavailable-banner">
      <div class="unavailable-icon">${t.unavailableIcon}</div>
      <p class="unavailable-title">${t.unavailableTitleOverride}</p>
      <p class="unavailable-note">${t.unavailableNoteOverride}</p>
    </div>`
  } else if (isCurrentlyUnavailable && hasDatedUnavailability) {
    // Dated absence (vacation, etc.) — show the actual date ranges
    unavailabilityBlock = `
    <div class="unavailable-banner">
      <div class="unavailable-icon">${t.unavailableIcon}</div>
      <p class="unavailable-title">${t.unavailableTitleDated}</p>
      ${unavailability.map(u => `<p class="unavailable-dates">${t.unavailableRange(formatDate(u.start_date, locale), formatDate(u.end_date, locale))}</p>`).join('')}
      <p class="unavailable-note">${t.unavailableNoteDated}</p>
    </div>`
  }

  // Signature line — email and phone/WhatsApp appended subtly under the name, like a classic email signature
  const contactEmail = config.public.contactEmail
  const contactPhone = config.public.contactPhone
  const whatsappNumber = (config.public.whatsapp || contactPhone || '').replace(/[^\d+]/g, '')

  const signatureContactLine = (contactEmail || contactPhone) ? `
        <p style="font-size:0.8rem;color:${theme.colorTextSiteNote};margin-top:0.25rem;">
          ${contactEmail ? `<a href="mailto:${contactEmail}" style="color:${theme.colorTextSiteNote};">${contactEmail}</a>` : ''}
          ${contactEmail && contactPhone ? ' · ' : ''}
          ${contactPhone ? `<a href="tel:${contactPhone.replace(/\s+/g, '')}" style="color:${theme.colorTextSiteNote};">${contactPhone}</a>` : ''}
          ${whatsappNumber ? ` · <a href="https://wa.me/${whatsappNumber}" style="color:${theme.colorTextSiteNote};">WhatsApp</a>` : ''}
        </p>` : ''

  return emailShell({
    title: t.title,
    locale,
    body: `
      <div class="email-header">
        <h1>${t.title}</h1>
        <div class="divider"></div>
      </div>
      <p style="text-align:center;font-size:0.85rem;color:${theme.colorTextSiteNote};margin-bottom:0.25rem;">${todayLabelCapitalized}</p>
      <p style="text-align:center;font-style:italic;font-size:1rem;margin-bottom:${theme.spacing};">${t.subtitle}</p>
      ${message ? `<p class="instruction" style="margin-bottom:${theme.spacing};">${message}</p>` : ''}
      ${unavailabilityBlock}
      ${busyBlock}
      ${scheduleTable}
      <p class="instruction">${instruction}</p>
      <div class="footer">
        <p style="font-size:0.9rem;margin-bottom:0.25rem;">${t.regards},<br/><strong style="font-size:0.9rem;color:${theme.colorTextFooter};">${adminName}</strong></p>
        ${signatureContactLine}
        <p style="margin-top:0.75rem;" class="site-note">${t.siteNote}</p>
      </div>
    `
  })
}