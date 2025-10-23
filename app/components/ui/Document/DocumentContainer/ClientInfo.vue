<template>
    <!-- Client details: name, address, optional SIRET, phone, and email -->
    <div class="client-section text-small">
        <div class="client-name text-bold">{{ client.name }}</div>
        <div>{{ formatFullAddress(client) }}</div>
        <div v-if="client.siret">SIRET: {{ client.siret }}</div>
        <div>{{ client.phone }}</div>
        <div>{{ client.email }}</div>
    </div>
</template>

<script setup>
const props = defineProps({ client: Object })

// Concatenate address and postal code/city, skip empty fields
const formatFullAddress = c => [c.address, `${c.postal_code} ${c.city}`].filter(Boolean).join(', ')
</script>

<style scoped>
.client-section {
    color: var(--text-color-dark);
    margin-bottom: 30px;
    text-align: end;
}

.client-name {
    font-weight: bold;
}
</style>