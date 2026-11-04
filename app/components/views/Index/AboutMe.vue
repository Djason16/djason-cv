<template>
    <!-- Home page: "About me": a statement and the presentation, then the portrait and the key facts -->
    <section id="about-me" class="about-section" aria-labelledby="about-title">
        <!-- Its own animation: the statement from the left and the text from the right, the photo rising, the facts from the right -->
        <div v-reveal="'split'" class="about-section__intro">
            <div class="about-section__lead">
                <p class="eyebrow">{{ t('aboutMe') }}</p>
                <h2 id="about-title" class="about-section__title text-display-l">{{ t('aboutStatement') }}</h2>
            </div>
            <p class="about-section__text text-body-l">{{ t('aboutDescription', variables) }}</p>
        </div>

        <div class="about-section__body">
            <figure v-reveal="'lift'" class="about-section__photo">
                <AppImage :src="photoSrc" :alt="t('aboutPhotoPortrait', { name: site.name })" width="864" height="950" />
                <figcaption class="eyebrow">{{ site.name }}<template v-if="site.area"> · {{ site.area }}</template></figcaption>
            </figure>

            <!-- Key facts, a thin line between them (only the ones filled in, admin > My info) -->
            <dl v-reveal="'slide'" class="about-section__facts">
                <div v-for="fact in facts" :key="fact.label" class="about-section__fact">
                    <dt class="eyebrow">{{ fact.label }}</dt>
                    <dd class="text-display-s">{{ fact.value }}</dd>
                </div>
            </dl>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import AppImage from '@/components/ui/Image/AppImage.vue'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

const { getTranslation: t } = useLang()
const site = useSite()

// Photo uploaded from the admin (My info), or the photo of the site
const photoSrc = computed(() => site.aboutPhoto ? `/api${site.aboutPhoto}` : '/images/about-me.jpg')

// Age from the birth date (admin > My info); null when it is not filled in
const age = computed(() => {
    const birth = new Date(site.birthDate)
    if (Number.isNaN(birth.getTime())) return null
    const today = new Date()
    const beforeBirthday = today.getMonth() < birth.getMonth()
        || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    return today.getFullYear() - birth.getFullYear() - (beforeBirthday ? 1 : 0)
})

// The area only, never the exact address (admin > My info)
const variables = computed(() => ({ name: site.name, address: site.area, age: age.value ?? '' }))

const facts = computed(() => [
    { label: t('aboutAgeLabel'), value: age.value && t('aboutAgeValue', { age: age.value }) },
    { label: t('aboutLocationLabel'), value: site.area },
    { label: t('aboutExpertiseLabel'), value: t('aboutExpertiseValue') },
].filter(fact => fact.value))
</script>
