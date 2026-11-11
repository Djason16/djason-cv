/*
 * Motion of the site in JS, read from the variables of assets/css/utils/variables.css
 * (--motion-fast / --motion-base / --motion-slow, --ease): one place to change the speed of every animation.
 *   motionMs('base')   duration in milliseconds (Web Animations API)
 *   motionEase()   the curve of the site, for the Web Animations API
 */
const FALLBACK = { fast: 0.35, base: 0.5, slow: 0.75 }

// Value of a CSS variable of :root (empty on the server)
const cssVar = (name: string) => (typeof document === 'undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue(name).trim())

// Duration in milliseconds
export const motionMs = (name: string) => Math.round((parseFloat(cssVar(`--motion-${name}`)) || (FALLBACK as Record<string, number>)[name] || 0) * 1000)
export const motionEase = () => cssVar('--ease') || 'cubic-bezier(0.33, 1, 0.68, 1)'
