<template>
    <!-- Tabs of the services and the details of the selected one -->
    <div class="services-section__nav" role="tablist" :aria-label="t('servicesTitle')">
        <button v-for="(service, i) in services" :key="i" :ref="el => setTabRef(el, i)" type="button"
            class="services-section__tab text-small" :class="{ 'services-section__tab--active': activeService === i }"
            @click="setActiveService(i)" @keydown="onKeydown($event, i)" role="tab"
            :aria-selected="activeService === i ? 'true' : 'false'" :aria-controls="`panel-${i}`" :id="`tab-${i}`"
            :tabindex="activeService === i ? 0 : -1">
            <i :class="service.icon" class="services-section__tab-icon" aria-hidden="true"></i>
            <span class="services-section__tab-title text-uppercase text-bold">
                {{ t(service.titleKey) }}
            </span>
        </button>

        <!-- Active tab indicator -->
        <div class="services-section__indicator" :style="{ left: `${activeService * (100 / services.length)}%` }"></div>
    </div>

    <!-- Tab panels -->
    <section v-for="(service, i) in services" :key="i" v-show="activeService === i"
        class="services-section__content fade-in" role="tabpanel" :id="`panel-${i}`" :aria-labelledby="`tab-${i}`"
        :tabindex="0">
        <h3 class="services-section__title text-xlarge text-bold text-uppercase">
            {{ t(service.titleKey) }}
        </h3>

        <p class="services-section__intro text-normal">
            {{ t(service.introKey) }}
        </p>

        <CustomList :items="service.sections" titleTag="h4" titleClass="text-large text-bold"
            titleColor="var(--text-color-light)" contentClass="text-normal" contentColor="var(--text-color-light)" />

        <p class="services-section__added-value text-normal">
            {{ t('addedValue') }}
            <span class="text-bold">{{ t(service.addedValueKey) }}</span>
        </p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { services } from "@/data/services.js"
import { ref } from "vue"
import CustomList from "@/components/ui/List/CustomList.vue"

const { getTranslation: t } = useLang()

// Active service index, defaulting to the middle tab
const activeService = ref(Math.floor(services.length / 2))
const tabRefs = ref([])

// Updates the active service when a tab is clicked
const setActiveService = i => (activeService.value = i)

// Keeps each tab element, to move the keyboard focus between them
const setTabRef = (el, i) => {
    if (el) tabRefs.value[i] = el
}

// Focuses a tab and shows its service
const focusTab = i => {
    tabRefs.value[i]?.focus()
    activeService.value = i
}

// Keyboard navigation of the tabs: arrows go to the next / previous one (looping), Home and End to the first / last
const onKeydown = (event, i) => {
    const lastIndex = services.length - 1

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        focusTab(i === lastIndex ? 0 : i + 1)
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        focusTab(i === 0 ? lastIndex : i - 1)
    }

    if (event.key === 'Home') {
        event.preventDefault()
        focusTab(0)
    }

    if (event.key === 'End') {
        event.preventDefault()
        focusTab(lastIndex)
    }
}
</script>

<style scoped>
/* Row of tabs */
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
    all: unset;
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
    will-change: transform;
}

/* Selected tab */
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

/* Bar under the selected tab, moved with "left" */
.services-section__indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: calc(100% / 3);
    height: 3px;
    background: var(--fourth-color);
    transition: left 0.3s ease;
    will-change: left;
}

/* Details of the selected service, faded in */
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

/* Tablet and phone */
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