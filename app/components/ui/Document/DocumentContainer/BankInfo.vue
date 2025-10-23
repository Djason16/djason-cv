<template>
    <!-- Simple bank info table displaying IBAN and BIC -->
    <table class="bank-table text-small">
        <thead>
            <tr>
                <th>IBAN</th>
                <th>BIC</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ bankInfo.iban }}</td>
                <td>{{ bankInfo.bic }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
const props = defineProps({ bankInfo: Object }) // Receives bank details object
</script>

<style scoped>
.bank-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}

.bank-table th {
    background: var(--third-color);
    color: var(--text-color-light);
    letter-spacing: .05em;
    padding: 8px 12px;
    border: 1px solid var(--second-color);
    text-align: center;
}

.bank-table td {
    background: var(--zero-color);
    color: var(--text-color-dark);
    padding: 8px 12px;
    border: 1px solid var(--second-color);
    text-align: center;
}
</style>