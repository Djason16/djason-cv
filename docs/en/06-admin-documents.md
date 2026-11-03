<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 06 — Admin & documents

**DOC-06** &nbsp;·&nbsp; [← Documentation](README.md)

The admin page makes **quotes** and **invoices** (stored, with their payments) and **contracts** (made from a finalized quote). Its tools are grouped on a dashboard.

## 01 — The dashboard (admin)

The most useful first:
1. **To do** (`AdminTodo.vue`, computed by `utils/billingTodo.js`): four columns in the order of the work, *To finalize* (drafts), *To get signed* (quotes without contract or not signed), *To collect* (payment awaited, with the whole amount), *To invoice* (missions not billed yet, one line per client). One click opens the document at its step, or the invoice of the client with their missions already ticked. Under it, what the server does alone (last run, emails sent) and *Run now*.
2. **Four buttons**: *New quote*, *New invoice*, *New mission*, *New client*.
3. **The cards**: **Work** (quotes & invoices, clients, missions) and **Site & availability** (projects, skills, texts, calendar, unavailability, forced status).
4. **Settings**, folded (*Show the settings*): my info, numbering, rates, password, environment.

- A list opens its own form: *Create client* in Clients, *Create mission* in Missions, *Add project* / the pencil of a row in Projects. Closing the form brings the list back (the blur behind stays until the last modal closes).
- Tables: click a value with a pencil, Enter or the green button saves. Clients, missions and projects come in pages (as many rows as the screen holds, no scrollbar); the arrow of a row opens its other values (columns with `detail: true` in `EditableTable`, pages: `per-page`, `TablePager.vue`). On a phone each row is a compact card (its first value as title, the others two by two).
- Forms: side by side on a computer (`FormModal` prop `columns`), the buttons always in sight.
- Machine translation: in Projects and Skills the French text fills the English a moment after typing; in Site texts a saved French text fills the English never changed by hand (`composables/useAutoTranslate.js`, MyMemory). Always check it.

| Part | Where |
| ---- | ----- |
| Cards, buttons, groups | `components/views/Admin/Admin.vue` (`TOOLS`, `QUICK`, `GROUPS`; texts `adminGroup*`, `adminHint_*`, `adminTodo*` in `plugins/translations/pages/admin/dashboard.js`); `AdminTodo.vue` (style `admin-todo.css`) |
| Projects | `ProjectListModal.vue` (compact rows), `CreateProjectModal.vue` (new and edit), `components/ui/Form/TagPicker.vue` (skills) |
| Skills | `SkillsModal.vue`, `composables/useSkills.js`, `server/controllers/SkillsController.js` |

## 02 — Quotes & invoices (admin → Quotes & invoices)

Like an invoicing tool: every quote and invoice is **stored** (table `dc_documents`, payments in `dc_payments`), with its state and its history.

1. **New quote / New invoice**: a draft. On the left the form (client, subject, dates, lines, discount, payment, notes), on the right the document itself, updated at every change.
   *Import missions*: tick the missions of the client to put on the document.
   **Paid by card by default** (payment link: paid, recorded and invoiced on its own); *Also offer a bank transfer* prints your IBAN on this document (and on its contract and invoices).
   What waits is on the dashboard (*To do*). A contract or an invoice of a quote has a *Path of quote* button to go back to it.
2. **Payment** of a quote: at once, **deposit + balance** (a percent or an amount), a **free schedule** (as many steps as needed, a percent or an amount each, the last one takes what remains) or **monthly payments** (number of months, first date).
3. **Finalize**: the document gets the next number of its series (proposed, it can still be changed), a copy of the client, and can no longer be changed (duplicate it to make a new one).
4. **Path of a quote** (`BillingFlow.vue`), always in this order: the quote, its contract (made and finalized from it in one click, or *No contract*: advised for a payment in several steps or from 1,500 €, else the quote signed with the terms is enough; *Add a contract after all* until the signature), both sent to the client by email in one click (both PDF attached) or downloaded, then signed by the client, then the payments: an invoice is made only when a payment comes in (by card on its own; another way with *Payment received*: date, amount, way); each step done is ticked, only the step of now shows its buttons. Quotes and contracts print under the signature that the terms are accepted and, for a consumer, the request to start before the 14 days of withdrawal end.
5. A finalized quote: *accepted* / *refused*, then **one invoice per step** (deposit invoice, installment invoices, balance invoice: the balance takes off what was already invoiced).
6. An invoice: **payments received** (date, amount, method); paid, partly paid, late and left to pay are computed alone.
7. **By email** (`composables/useDocumentMail.js` → `POST /api/documents/{id}/send`, `server/helpers/DocumentMailHelper.js`, templates `server/templates/DocumentMails.js`): *Send by email* on any finalized document, the PDF attached, a copy for you, the date of sending kept. The PDF is drawn by the browser of the admin (the same as the download), the server sends it. After a payment:
   - recorded in the admin (*Payment received*, *Record the payment*): the client gets *Paiement reçu* at once with the invoice attached;
   - online (Stripe, automatic debit): the client gets *Paiement reçu* at once with the *Download my invoice* button (`/pay-me/?doc=<link of the invoice>&pdf=1`: the same PDF, drawn in their browser, `GET /api/stripe/document-file`), you get *Nouveau paiement*. One PDF engine only: the one of the browser (the server draws none); a sending that failed is done again by the automatic task (`options.mailPending`).
8. **On its own** (`server/plugins/billing-tasks.js` → `BillingTasksHelper`: 90 s after the start then every 30 minutes; *Run now*: `POST /api/documents/tasks`, last run: `GET /api/documents/tasks`, kept in `dc_settings.billingTasksLastRun`):
   - the invoices not sent yet are sent again;
   - once a day from 9 am, in the **time zone of the agenda** (admin → Calendar; `TimeZoneHelper`, `utils/display.js` `todayIso`: it also sets the date of the documents), the reminders of `ReminderHelper` (templates `ReminderMails.js`), each one once (`options.reminders`): unpaid invoice on its date then 7 days later; next step of a signed quote 3 days before, on the day then 7 days later (not with the automatic debit, which has its own emails); quote ending soon (3 days before the end) to the client; quote sent and not signed after 7 days, for you.
   Online, the application must run all the time (it does not sleep at Infomaniak).
9. **PDF** at any time, downloaded at once (no print window): the sheet of the preview drawn into an A4 PDF, real text that can be selected, in the fonts of the site, in the ink of the site, with the French notices (late penalties, €40 fee for professionals, VAT not applicable when no line has VAT).

| Part | Where |
| ---- | ----- |
| Screens | `components/views/Admin/Billing/` (`BillingModal`: list or editor; `BillingList`, `BillingEditor`, `EditorLines`, `EditorPlan`, `BillingActions`) |
| Data | `stores/billing.js` (+ `stores/actions/billingActions.js`) → `/api/documents` |
| Amounts (shared by the browser and the server) | `utils/billing.js`: totals, discount, VAT per rate, payment steps, paid / left to pay |
| Server | `server/controllers/DocumentsController.js`, `server/helpers/DocumentsHelper.js` (numbers, invoices from a quote) |
| Document and PDF | `components/views/Documents/BillingDocument.vue` (style `billing-document.css`); `utils/pdf.js` (lays the sheet out), `utils/pdfRender.js` (draws it with jsPDF: pages, grounds, words, links), `utils/pdfFonts.js` (fonts of `public/fonts/`) |

## 03 — Missions (admin → Missions)

A mission is a piece of work to invoice, for any client: time spent (hourly rate × duration × quantity) or a fixed price, with a title and an optional description. To invoice some, open a new invoice for the client → *Import missions*: the missions not billed yet are listed, tick the ones to put together (*Tick all* for every one; the total ticked is shown). Each line of the invoice shows under its title the date of the mission in full, then its description. Once the invoice is finalized, its missions show *FA-… ✓* and cannot be invoiced again nor changed; a cancelled invoice gives them back. A project with a quote (site, video…) does not need missions.

| Part | Where |
| ---- | ----- |
| Screens | `CreateMissionModal.vue`, `MissionListModal.vue` (column *Invoice*), `Billing/EditorLines.vue` (missions to tick) |
| Server | `server/controllers/MissionsController.js`; `dc_missions.invoice_id` set by `DocumentsHelper.finalize` (lines with `missionId`), cleared when the invoice is cancelled |

## 04 — Online payment (payment link)

A finalized quote or an invoice with something left to pay has a **payment link** (*Online payment → Create the payment link*, copied at once, also printed on its PDF):
`/pay-me/?doc=<secret>`. The Pay me page then shows the document and the amount, which the client cannot change, and opens Stripe.

- **Invoice**: the client pays what is left; the payment (method *Stripe*) is added to the invoice.
- **Quote**: the client pays its next step (deposit, installment, or the whole). The invoice of this step is made (or the one already made is used), numbered, and gets the payment; the quote becomes *accepted*. If that invoice cannot be made, the payment stays on the quote (see the server logs).
- The amount always comes from the document (server side); a session is saved only once.
- **Automatic debit** (a quote in several dated steps: monthly, schedule): the page shows every step; the client can tick the automatic debit when paying the first one (their agreement, also shown by Stripe). Stripe keeps the card; `server/plugins/autopay.js` (a minute after the start, then every 6 hours) charges each next step on its date with `AutopayHelper`, makes and settles its invoice, Stripe sends the receipt. A refused card: one email to the client (with a button to pay by hand) and one to you; the debit stays on. The admin shows it (*Online payment*) and can stop it.
- **Look**: the Stripe pages take the ink, the mint button and the square corners of the site (`branding_settings`, `StripeHelper.js`; the logo only once online); the result pages (`server/templates/StripePages.js`) and every email (`server/templates/MailLayout.js`) follow the site too.
- Saved when the client closes the Stripe window, and by the **webhook** `POST /api/stripe/webhook` (event `checkout.session.completed`), which also works when the client closes the page too early. Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`; online: Stripe Dashboard → Developers → Webhooks, with the address of the site. Its secret goes to `STRIPE_WEBHOOK_SECRET`.

| Part | Where |
| ---- | ----- |
| Links, summary, saving | `server/helpers/PayLinkHelper.js` (column `pay_token` of `dc_documents`) |
| Automatic debit | `server/helpers/AutopayHelper.js`, `server/plugins/autopay.js`, `server/templates/AutopayMails.js` (`options.autopay` of the quote) |
| Stripe | `server/controllers/StripeController.js` (`document`, `createCheckout` with a token, `checkPayment`, `webhook`), `server/helpers/StripeHelper.js` |
| Page | `components/views/PayMe/PayDocument.vue` (shown by `PayMe.vue` with `?doc=`), `PaySchedule.vue` (the steps) |
| Admin | `components/views/Admin/Billing/BillingActions.vue` (*Online payment*) |

## 05 — Numbering (admin → Numbering)

For each type (quotes, invoices, contracts): a **prefix** (`DE`, `D`, `DEV`... any letters), a **format** and the **figures** of the counter, with the next number shown live.

| Format | Example | The counter starts again |
| ------ | ------- | ------------------------ |
| `{P}-{YYYY}-{N}` (default) | `DE-2026-0001` | each year |
| `{P}{YYYY}-{N}`, `{P}{YYYY}{N}`, `{P}-{YY}-{N}` | `DE2026-0001`, `DE20260001`, `DE-26-0001` | each year |
| `{P}-{YYYY}{MM}-{N}`, `{P}{YY}{MM}{N}` | `DE-202611-0001`, `DE26110001` | each month |
| `{P}-{N}`, `{P}{N}` | `DE-0001` | never |

A custom format works too (`{P}` prefix, `{YYYY}` / `{YY}` year, `{MM}` month, `{N}` counter).
**Go on from**: type the next number wanted (`CO-2026-0007`): it is used when it comes after the last number already given in that series.
Invoices must stay continuous and in order: change the format preferably on 1 January.

| Part | Where |
| ---- | ----- |
| Rules (shared by the browser and the server) | `utils/numbering.js` (`nextNumber`, `numberingOf`, `NUMBER_FORMATS`) |
| Screen | `components/views/Admin/NumberingModal.vue` |
| Stored | `dc_settings`, key `numbering` (JSON), read by `server/helpers/DocumentsHelper.js` when finalizing |

## 06 — Contracts (admin → Quotes & invoices → Contracts)

A contract is made from a finalized quote (*Create the contract*, with the kind of service: web, video or repair): it takes its client,
its amounts and its payment plan, gets its number when finalized (`CO-2026-0001`) and is marked *signed* once the client signed it.
Its articles are in `components/views/Documents/ContractContainer/` (style `contract-container.css`, the same sheet as the invoices);
`utils/contractDocument.js` turns the stored contract into the props of the template.

**Interest rate**: quotes, invoices and contracts use the legal rate of the issue date for the kind of client (admin → Rates,
one rate per half-year, professional and individual). The editor shows it, and warns when the rate of the half-year is missing;
the PDF prints the penalties (three times the legal rate). The rate is kept with the document once finalized.

## 07 — Changing a template

Edit the components of `components/views/Documents/` freely, but **keep their CSS classes**:
the page breaks of the PDF rely on them.
Their **texts** (labels, notices, articles of the contracts) are changed without code in admin → Site texts → *Documents: quotes and invoices* / *Documents: contracts* (files `plugins/translations/pages/admin/billingDocument.js` and `contracts.js`).

---

<p align="center"><sub><a href="05-api.md">← 05 — The API</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="07-security.md">07 — Security →</a></sub></p>
