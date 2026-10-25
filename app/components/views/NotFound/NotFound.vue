<template>
    <!-- Content of the error page: 404 (unknown address) or server error, same layout as the other pages -->
    <OtherSectionLayout :pageTitleKey="`${errorKey}Title`" :pageSubtitleKey="`${errorKey}Subtitle`" :sections="errorSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)"
        contentClass="text-normal" contentColor="var(--text-color-light)" :dynamicData="providerInfo">
        <template #custom-content>
            <SlideInFromRight>
                <div class="error-actions">
                    <HeroButton :label="t('backHome')" iconClass="fas fa-home"
                        :ariaLabel="t('backHome')" :title="t('backHome')"
                        @click="goHome" />
                </div>
            </SlideInFromRight>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { clearError } from '#app'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { useRouter } from 'vue-router'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useSeo } from '@/composables/useSeo.js'

const { getTranslation: t } = useLang()

// Error given by error.vue (statusCode 404, 500...)
const props = defineProps({ error: { type: Object, default: null } })

const site = useSite()

const router = useRouter()

// Clears the error then navigates with the router (no full page reload)
const goHome = async () => {
    await clearError()
    await router.push(withTrailingSlash('/'))
}

// Builds provider info dynamically
const providerInfo = {
    name: site.name,
    email: site.email,
    phone: site.phone
}

// Server error page for 5xx (500, 503...), "page not found" for an unknown address (404) and other 4xx
const errorKey = Number(props.error?.statusCode ?? 404) >= 500 ? 'serverError' : 'notFound'

// Generates error page sections dynamically
const errorSections = Array.from({ length: errorKey === 'notFound' ? 4 : 3 }, (_, i) => ({
    titleKey: `${errorKey}Section${i + 1}Title`,
    contentKey: `${errorKey}Section${i + 1}Content`
}))

// Setup SEO and refresh on language changes
useSeo(errorKey)
</script>

<style scoped>
.error-actions {
    margin-top: 2rem;
}
</style>