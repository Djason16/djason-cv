<template>
    <!-- Admin dashboard layout -->
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template v-slot:custom-content>
            <div class="admin-dashboard">
                <SlideInFromRight>
                    <!-- Logout button with dynamic label -->
                    <HeroButton :label="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        iconClass="fas fa-sign-out-alt" :disabled="loggingOut" @click="handleLogout" />
                </SlideInFromRight>

                <!-- Display any logout messages -->
                <MessageBox :message="message" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import { computed, ref, watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '~/composables/useAuth'

const { $lang } = useNuxtApp()
const { logout } = useAuth()

// Reactive state
const loggingOut = ref(false)
const message = ref(null)

// Generate admin sections dynamically
const adminSections = computed(() =>
    Array.from({ length: 4 }, (_, i) => ({
        titleKey: `adminSection${i + 1}Title`,
        contentKey: `adminSection${i + 1}Content`
    }))
)

// Setup SEO dynamically
const pageKey = 'admin'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Logout handler
const handleLogout = async () => {
    loggingOut.value = true
    const success = await logout()
    if (!success) message.value = { key: 'logoutError', type: 'error' }
    loggingOut.value = false
}

// Protect page via middleware
definePageMeta({ middleware: 'auth-server' })
</script>

<style scoped>
.admin-dashboard {
    text-align: left;
    margin-top: 2rem;
}
</style>