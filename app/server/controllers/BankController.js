// Bank details printed on quotes, invoices and contracts (BANK_IBAN / BANK_BIC, admin only): GET /api/bank
export default class BankController extends Controller {
    async getAll(event) {
        const { bankIban, bankBic } = useRuntimeConfig()
        return ResponseHelper.success(event, { bank: { iban: bankIban || null, bic: bankBic || null } })
    }
}
