<template>
    <!-- Bank details of the quote or invoice: IBAN and BIC -->
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
// { iban, bic }
defineProps({ bankInfo: Object })
</script>
