export const waitForElement = async (container, selector, timeout = 5000) => {
    const startTime = Date.now()
    const pollInterval = 100

    // Poll until the element exists, has layout, or the timeout expires
    while (Date.now() - startTime < timeout) {
        const element = container.querySelector(selector)
        if (element?.offsetHeight > 0) return element

        await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Element ${selector} not found or empty after ${timeout}ms`)
}