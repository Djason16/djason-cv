// Site name and URL, plus the public contact (NUXT_PUBLIC_PERSONAL_NAME, NUXT_PUBLIC_FRONTEND_DOMAIN,
// NUXT_PUBLIC_PERSONAL_EMAIL, NUXT_PUBLIC_PERSONAL_PHONE in .env / .env.production)
export const useSite = () => {
    const { name, frontendDomain, contactEmail, contactPhone } = useRuntimeConfig().public
    return { name, url: frontendDomain, email: contactEmail, phone: contactPhone }
}
