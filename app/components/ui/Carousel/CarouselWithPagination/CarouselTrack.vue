<template>
    <!-- Carousel track container, dynamically applying 'no-transition' class when transition is disabled -->
    <div class="carousel-track" :class="{ 'no-transition': !transitionEnabled }" :style="trackStyle">

        <!-- Loop through each slide item and render it within the carousel -->
        <div v-for="(item, index) in slides" :key="index" class="carousel-item">
            <!-- Slot allows the parent component to pass custom content for each carousel item -->
            <slot :item="item">
                <div class="carousel-content">
                    <div class="carousel-overlay">
                        <!-- Title of the project or carousel item -->
                        <h3 class="project-title text-xlarge">{{ item.name }}</h3>
                        <!-- Short description of the project or carousel item -->
                        <p class="project-description text-normal">
                            {{ $lang.getTranslation(item.shortDescriptionKey) }}
                        </p>
                        <!-- Skills associated with the project or carousel item -->
                        <ul class="project-skills">
                            <li v-for="(skill, i) in item.skills" :key="i" class="skill  text-normal">
                                {{ $lang.getTranslation(skill) || skill }}
                            </li>
                        </ul>
                        <!-- If a link exists for the project, display a "View More" button -->
                        <a v-if="item.link" :href="item.link" target="_blank"
                            class="project-link text-normal text-bold text-uppercase">
                            {{ $lang.getTranslation('viewMore') || 'View More' }}
                        </a>
                    </div>
                    <!-- Image for the project or carousel item -->
                    <img :src="item.image" :alt="item.name" class="carousel-image" />
                </div>
            </slot>
        </div>
    </div>
</template>

<script setup>
// Define props passed to the component, which are:
// slides (list of items to display in the carousel)
// trackStyle (styling for the carousel track)
// transitionEnabled (boolean to enable/disable transitions)
defineProps(["slides", "trackStyle", "transitionEnabled"]);
</script>

<style scoped>
.carousel-track {
    display: flex;
    gap: 1rem;
    transition: transform 0.5s ease;
}

.carousel-track.no-transition {
    transition: none !important;
}

.carousel-item {
    flex: none;
    width: 40rem;
    height: 30rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease-in-out;
}

.carousel-content {
    position: relative;
    height: 100%;
    width: 100%;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.carousel-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    color: var(--text-color-light);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 10rem;
    transition: opacity 0.3s ease-in-out;
    z-index: 2;
}

.carousel-content:hover .carousel-overlay {
    opacity: 1;
}

.carousel-content:hover .carousel-image {
    filter: brightness(0.5);
}

.project-title {
    margin-bottom: 0.5rem;
}

.project-description {
    margin-bottom: 1rem;
}

.project-skills {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 0.5rem;
    justify-content: center;
}

.project-skills li:nth-child(7),
.project-skills li:nth-child(8),
.project-skills li:nth-child(9) {
    grid-column: 2 / span 1;
    justify-self: center;
}

.skill {
    background: var(--first-color);
    color: var(--text-color-dark);
    padding: 0.25rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 5rem;
    border-radius: 4px;
}

.project-link {
    color: var(--text-color-light);
    text-decoration: none;
}

@media (max-width: 1024px) {
    .carousel-item {
        width: 35rem;
        height: 25rem;
    }

    .carousel-overlay {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding: 1rem;
    }

    .project-skills {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .carousel-overlay {
        align-items: center;
    }

    .project-description {
        padding-inline: 10rem;
    }

    .project-skills {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .project-skills li:nth-child(7),
    .project-skills li:nth-child(8),
    .project-skills li:nth-child(9) {
        grid-column: 1 / span 2;
    }
}
</style>
