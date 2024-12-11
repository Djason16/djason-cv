<template>
    <!-- Navigation tabs for selecting services -->
    <div class="services-section__nav">
        <!-- Loop through all services to create a tab for each one -->
        <div v-for="(service, index) in services" :key="index"
            class="services-section__tab text-uppercase text-small text-bold"
            :class="{ 'services-section__tab--active': activeService === index }" @click="setActiveService(index)">
            <!-- Icon of the service -->
            <i :class="service.icon" class="services-section__tab-icon"></i>
            <!-- Title of the service -->
            <span class="services-section__tab-title">
                {{ $lang.getTranslation(service.titleKey) }}
            </span>
        </div>
        <div class="services-section__indicator" :style="{ left: `${activeService * (100 / services.length)}%` }">
        </div>
    </div>

    <!-- Content area for the selected service -->
    <div class="services-section__content fade-in" :key="activeService">
        <!-- Title of the active service -->
        <h2 class="services-section__title text-xlarge text-bold text-uppercase">
            {{ $lang.getTranslation(activeServiceData.titleKey) }}
        </h2>

        <!-- Introductory text of the active service -->
        <p class="services-section__intro text-normal">
            {{ $lang.getTranslation(activeServiceData.introKey) }}
        </p>

        <!-- List of key features or sections for the active service -->
        <CustomList :items="activeServiceData.sections" titleTag="h3" titleClass="text-large text-bold"
            titleColor="var(--text-color-light)" contentClass="text-normal" contentColor="var(--text-color-light)" />

        <!-- Added value description for the active service -->
        <p class="services-section__added-value text-normal">
            {{ $lang.getTranslation("addedValue") }}
            <span class="text-bold">{{ $lang.getTranslation(activeServiceData.addedValueKey) }}</span>
        </p>
    </div>
</template>

<script setup>
import { services } from "@/src/data/servicesData.js"; // Services data
import { computed, ref } from "vue"; // Vue 3 composition API
import CustomList from "../../ui/List/CustomList.vue"; // Custom list component

// Active service tab index (default to the middle service)
const activeService = ref(Math.floor(services.length / 2));

// Function to update the active service index
const setActiveService = (index) => {
    if (index !== activeService.value) {
        activeService.value = index;
    }
};

// Computed property to get data for the currently active service
const activeServiceData = computed(() => services[activeService.value]);
</script>

<style scoped>
.services-section__nav {
    display: flex;
    position: relative;
    width: 80%;
    background: var(--first-color);
    margin-bottom: 2rem;
    overflow: hidden;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease;
}

.services-section__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    color: var(--third-color);
    padding: 1rem;
    transition: transform 0.3s ease, color 0.3s ease;
}

.services-section__tab--active {
    color: var(--text-color-dark);
    transform: scale(1.1);
    transition: transform 0.3s ease, color 0.3s ease, background 0.3s ease;
}

.services-section__tab-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
}

.services-section__tab--active .services-section__tab-icon {
    color: var(--text-color-dark);
}

.services-section__indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: calc(100% / 3);
    height: 3px;
    background: var(--fourth-color);
    transition: left 0.3s ease;
}

.services-section__content {
    width: 80%;
    text-align: left;
    animation: fadeIn 0.5s ease-in-out;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.services-section__content>* {
    margin: 0 0 1rem 0;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@media (max-width: 1024px) {
    .services-section__nav {
        background: transparent;
        flex-direction: column;
        gap: 1rem;
    }

    .services-section__tab {
        background: var(--first-color);
    }

    .services-section__tab--active {
        transform: none;
    }

    .services-section__indicator {
        display: none;
    }
}
</style>
