import posthog from 'posthog-js'

const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

if (!apiKey || !apiHost) {
  if (import.meta.env.DEV) {
    const missingVariable = !apiKey ? 'VITE_PUBLIC_POSTHOG_KEY' : 'VITE_PUBLIC_POSTHOG_HOST'
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    )
  }
} else {
  posthog.init(apiKey, {
    api_host: apiHost,
  })
  posthog.startExceptionAutocapture()
}

export default posthog
