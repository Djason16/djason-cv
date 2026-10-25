// Color palette for sections
export const colors = ["var(--third-color)", "var(--second-color)"];

// Gets a color based on section index, cycling through the palette
export const getColor = index => colors[index % colors.length];