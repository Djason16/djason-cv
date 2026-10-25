<template>
    <!-- Client of the quote or invoice: name, address, SIRET when given, phone and email -->
    <div class="client-section text-small">
        <div class="client-name text-bold">{{ client.name }}</div>
        <div>{{ formatFullAddress(client) }}</div>
        <div v-if="client.siret">SIRET: {{ client.siret }}</div>
        <div>{{ client.phone }}</div>
        <div>{{ client.email }}</div>
    </div>
</template>

<script setup>
defineProps({ client: Object })

// Concatenate address and postal code/city, skip empty fields
const formatFullAddress = c => [c.address, `${c.postal_code} ${c.city}`].filter(Boolean).join(', ')
</script>
