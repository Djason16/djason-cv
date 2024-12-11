<template>
    <!-- Services section container -->
    <section id="services" class="services-section">
        <div class="services-section__content">
            <!-- Services section title -->
            <h2 class="services-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('servicesTitle') }}
            </h2>
            <!-- Services section description -->
            <div class="services-section__description text-normal">
                {{ $lang.getTranslation('servicesDescription') }}
            </div>
        </div>

        <!-- Render a card component for displaying individual services -->
        <SectionCard />
    </section>
</template>

<script setup>
import SectionCard from "../../ui/Tab/ServiceCard.vue"; // Service card component
</script>

<style scoped>
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

@media (max-width: 1024px) {
    .services-section__title {
        margin: 0;
    }
}
</style>