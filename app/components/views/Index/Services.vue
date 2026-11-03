<template>
    <!-- Home page: services, one column per service (roman numbers), then everything they include as a numbered list -->
    <section id="services" class="services-section" aria-labelledby="services-title">
        <SectionHead id="services-title" reveal="line" :label="t('servicesLabel')" :title="t('servicesTitle')" :text="t('servicesDescription')" />

        <ol class="services-columns">
            <li v-for="(service, i) in services" :key="service.titleKey" v-reveal class="services-column" :style="{ '--reveal-delay': `calc(var(--reveal-stagger) * ${i})` }">
                <span class="services-column__number text-numeral" aria-hidden="true">{{ ROMAN[i] }}</span>
                <h3 class="eyebrow services-column__title">{{ t(service.titleKey) }}</h3>
                <p class="services-column__text text-body">{{ t(service.introKey) }}</p>
                <p class="services-column__value text-body">{{ t(service.addedValueKey) }}</p>
            </li>
        </ol>

        <!-- Everything the services include, numbered on two columns -->
        <p v-reveal class="eyebrow services-list__label">{{ t('servicesListLabel', { count: steps.length }) }}</p>
        <ol class="services-list">
            <!-- Their own animation: a mint line draws under each item, then its number and text slide in, row by row -->
            <li v-for="(step, i) in steps" :key="step.titleKey" v-reveal="'line'" class="services-list__item" :style="{ '--reveal-delay': `calc(var(--reveal-stagger) * ${i % 2})` }">
                <span class="services-list__number eyebrow" aria-hidden="true">{{ padIndex(i) }}</span>
                <div>
                    <h4 class="services-list__title text-display-s">{{ t(step.titleKey).replace(/^\d+\.\s*/, '') }}</h4>
                    <p class="services-list__text text-body">{{ t(step.contentKey) }}</p>
                </div>
            </li>
        </ol>
    </section>
</template>

<script setup>
import { padIndex } from '@/utils/display.js'
import SectionHead from '@/components/ui/SectionLayout/SectionHead.vue'
import { useLang } from '@/composables/useLang.js'
import { services } from '@/data/services.js'

const { getTranslation: t } = useLang()

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

// The parts of every service, one after the other
const steps = services.flatMap(service => service.sections)
</script>
