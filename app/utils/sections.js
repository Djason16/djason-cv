// =======================
// COLORS CONFIGURATION
// =======================

// Color palette
// This array defines the available colors used across sections.
// --third-color: Represents the third color in the design system.
// --second-color: Represents the second color in the design system.
export const colors = ["var(--third-color)", "var(--second-color)"];

/**
 * Retrieve a color based on the section index.
 * This ensures alternating or repeated colors based on the section index.
 *
 * @param {number} index - The index of the section.
 * @returns {string} - The corresponding color for the section.
 */
export function getColor(index) {
    return colors[index % colors.length];
}
