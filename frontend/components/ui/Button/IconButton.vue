<template>
    <!-- Square button with an icon (tables, cookie banner), the text beside it when "text" is set; the label is the tooltip
         and what screen readers read. The icons are SVG drawn here (always centered, sharp at any size). -->
    <button type="button" class="icon-btn" :title="label" :aria-label="label"
        :class="[`icon-btn--${variant}`, `icon-btn--${size}`, { 'icon-btn--text': text }]">
        <svg class="icon-btn__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="ICONS[icon]?.path" />
            <circle v-for="(c, i) in ICONS[icon]?.circles || []" :key="i" :cx="c[0]" :cy="c[1]" r="2" />
        </svg>
        <span v-if="text" class="icon-btn__text text-label">{{ text }}</span>
    </button>
</template>

<script setup lang="ts">
defineProps({
    // Name of the icon: check, close, trash, download, sliders, save, chevron-left, chevron-right
    icon: { type: String, required: true },
    // Tooltip and text read by screen readers
    label: { type: String, required: true },
    // 'primary' (filled, the main action), 'ghost' (light, a secondary action) or 'danger' (red on hover: delete)
    variant: { type: String, default: 'ghost' },
    // 'tiny' (1.75rem, beside thin elements), 'small' (2.25rem, as high as the fields) or 'large' (2.75rem)
    size: { type: String, default: 'small' },
    // Text shown beside the icon (the button gets wider)
    text: { type: String, default: '' },
})

// Icons on a 24 x 24 grid, drawn with a 2px line
const ICONS: Record<string, { path: string, circles?: number[][] }> = {
    check: { path: 'M5 12.5l4.5 4.5L19 7.5' },
    close: { path: 'M6.5 6.5l11 11M17.5 6.5l-11 11' },
    trash: { path: 'M4 7h16M9 7V4.5h6V7M6.5 7l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v5.5M14 11v5.5' },
    download: { path: 'M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14' },
    'chevron-left': { path: 'M14.5 6l-6 6 6 6' },
    'chevron-right': { path: 'M9.5 6l6 6-6 6' },
    sliders: { path: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1', circles: [[15, 6], [9, 12], [17, 18]] },
    save: { path: 'M5 4h11l3 3v13H5zM8.5 4v4.5h6V4M8 20v-6h8v6' },
    pen: { path: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4' },
    copy: { path: 'M8 8h11v12H8zM5 16V4h11' },
    plus: { path: 'M12 5v14M5 12h14' },
    euro: { path: 'M17.5 6.5A7 7 0 1 0 17.5 17.5M4 10h9M4 14h9' },
}
</script>
