<template>
    <!-- Home page: services section (tabs in ServiceCard) -->
    <section id="services" class="services-section" aria-labelledby="services-section__title">
        <div class="services-section__content">
            <h2 id="services-section__title" class="services-section__title text-tall text-uppercase">
                {{ t('servicesTitle') }}
            </h2>

            <div class="services-section__description text-normal">
                {{ t('servicesDescription') }}
            </div>
        </div>

        <!-- Tabs of the services -->
        <SectionCard />
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import SectionCard from '@/components/views/Index/ServiceCard.vue'

const { getTranslation: t } = useLang()
</script>

<style scoped>
/* Text on one side, tabs on the other */
.services-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin: auto;
}

.services-section__content {
    flex: 1;
    max-width: 80%;
    text-align: center;
    padding: 0 0 2rem 0;
}

.services-section__title {
    margin: 0 0 1rem;
}

.services-section__description {
    margin: 0;
    line-height: 1.5;
}

/* Tablet and phone */
@media (max-width: 1024px) {
    .services-section__title {
        margin: 0;
    }
}
</style>