# 6. Admin documents

[← Documentation](README.md)

The admin page generates **quotes**, **invoices** and **contracts** as PDF, from the clients, missions and services stored in the database.
Nothing is stored on the server: the PDF is downloaded directly.

| Part | Where |
| ---- | ----- |
| Screen | `components/views/Admin/DocumentsModal.vue` (one modal, `kind` = quote, invoice or contract) |
| Data, questions to the admin, filling the template | `composables/useDocuments.js` (missions, clients and services, grouped per document) |
| Rules and amounts | `utils/documents.js` (payment rules per service, totals, schedules, prices) |
| Checks before generating | `utils/documentChecks.js` |
| Templates | `components/views/Documents/`: `DocumentContainer` (quote / invoice), `ContractContainer` (contract) |
| PDF export | `utils/pdf.js` (html2pdf.js, in the browser) |

## One document per group

| Client | Grouped by | Documents |
| ------ | ---------- | --------- |
| Company | client and month | Invoice only (monthly, the day shown as `XX`) |
| Individual, freelance, association | client, mission day and service | Quote, invoice and contract |

## Checks

Nothing is generated when something is missing. An alert lists what to fix, for example:

- your SIRET or address in `.env` ([Configuration](02-configuration.md))
- the client's address
- the mission's price
- IBAN / BIC
- for a contract: an interest rate active today (admin → Interest rates)

## Changing a template

Edit the components of `components/views/Documents/` freely, but **keep their CSS classes**:
the page breaks of the PDF rely on them.
