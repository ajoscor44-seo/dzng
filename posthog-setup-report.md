# PostHog setup report

PostHog browser analytics was installed, initialized from Vite environment variables, connected to Supabase identity, instrumented with 11 custom success events, and added to a starter dashboard.

## Verified by this run

- **Installed:** `posthog-js` 1.409.5 is declared in `package.json` and resolved in `package-lock.json` using npm.
- **Initialization:** `src/posthog.js` is the single initialization point. It reads `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST`, initializes only when both are configured, preserves default autocapture/session behavior, and reports a development error when configuration is missing while remaining a production no-op.
- **App startup:** `src/main.jsx` imports the initialization module before rendering the app.
- **User identification:** Wired in `src/context/AppContext.jsx` using the Supabase authenticated user's stable ID. Email, full name, and username are sent as person properties; logout resets identity, and account switches reset before identifying the new account. Auth events can still be anonymous at the immediate success callback until the auth listener completes.
- **Error tracking:** `posthog.startExceptionAutocapture()` runs after initialization in `src/posthog.js`, covering uncaught browser exceptions and unhandled promise rejections.
- **Build:** `npm run build` passed after the integration changes; Vite transformed 193 modules. The only build output was the existing large-chunk warning.
- **Dashboard:** [Analytics basics (wizard)](https://us.posthog.com/project/536746/dashboard/1935616) contains five tagged insights using the captured event names. It is expected to remain empty until events arrive.

## Events instrumented

These are planned success-path captures recorded in `.posthog-wizard-cache/.posthog-events.json`. The run verified capture call sites and event definitions, but did **not** run the browser or observe events arriving in PostHog.

| Event | What it measures | File |
|---|---|---|
| `user_logged_in` | Authenticated user successfully signs in | `src/views/Auth.jsx` |
| `user_registered` | New account registration succeeds | `src/views/Auth.jsx` |
| `password_reset_requested` | Password reset email request succeeds | `src/views/Auth.jsx` |
| `number_rented` | Virtual number rental completes successfully | `src/views/Client/RentNumbers.jsx` |
| `virtual_wallet_generated` | Dedicated virtual bank account generation succeeds | `src/views/Client/Wallet.jsx` |
| `subscription_purchased` | Shared subscription access slot purchase succeeds | `src/views/Client/Subscriptions.jsx` |
| `esim_purchased` | eSIM package purchase completes successfully | `src/views/Client/eSIM.jsx` |
| `otp_number_requested` | Temporary verification number request succeeds | `src/views/Client/SMSVerification.jsx` |
| `otp_number_reuse_requested` | Temporary number reuse request succeeds | `src/views/Client/ReuseNumbers.jsx` |
| `smm_order_submitted` | Social media marketing order is accepted | `src/views/Client/SmmPanel.jsx` |
| `support_ticket_created` | Support ticket submission succeeds | `src/views/Client/Support.jsx` |

## Not verified and follow-up issues

- **Event delivery is unconfirmed:** No browser session, network request, or PostHog event arrival was observed. The build proves compilation only; it does not prove that captures flow.
- **Authentication timing remains unresolved:** Auth-related captures may occur before the Supabase auth-state listener has identified the session. If left unresolved, login and registration attribution can begin on an anonymous distinct ID before later events inherit the authenticated ID. Review `src/views/Auth.jsx` capture call sites and `src/context/AppContext.jsx` auth handling.
- **Environment deployment is unresolved:** The run confirmed both keys exist in the wizard-managed local `.env`, but did not verify that deployment environments provide them. Without them, production intentionally becomes a no-op and events are silently absent. The documented names are in `.env.example` lines 1–2 and are read in `src/posthog.js` lines 3–4.

## Build and lint conflict

`npm run lint` failed with 56 errors and 125 warnings, primarily pre-existing conditional-hook violations in `src/views/Admin/AdminDashboard.jsx` and unrelated warnings. A scoped lint of touched files still reported seven pre-existing conditional-hook errors in `src/views/Client/eSIM.jsx` and 52 existing warnings. No lint error referenced `src/posthog.js` or the review fixes. This is a project lint conflict, not a reported PostHog integration error. The production build passed; its existing >500 kB chunk warning remains.

## Before you merge

- [ ] Run the full production build again and confirm the generated integration still compiles; the shared initialization is in `src/posthog.js` lines 1–18.
- [ ] Run the test suite and update any mocks or fixtures affected by captures in `src/views/Auth.jsx`, `src/views/Client/RentNumbers.jsx`, `src/views/Client/Wallet.jsx`, `src/views/Client/Subscriptions.jsx`, `src/views/Client/eSIM.jsx`, `src/views/Client/SMSVerification.jsx`, `src/views/Client/ReuseNumbers.jsx`, `src/views/Client/SmmPanel.jsx`, and `src/views/Client/Support.jsx`.
- [ ] Set `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST` in every deployment environment, not only local `.env`; see `.env.example` lines 1–2 and reads in `src/posthog.js` lines 3–4.
- [ ] Because the app ships a minified browser bundle, add source-map upload to CI so production error stack traces can be de-minified; see https://posthog.com/docs/error-tracking/upload-source-maps.
- [ ] Exercise login, registration, and one authenticated action in a real browser, then confirm the expected events arrive in PostHog and are attributed to the stable Supabase user ID; inspect `src/views/Auth.jsx` and `src/context/AppContext.jsx`.

## Source of truth

This report is based only on `.posthog-wizard-cache/queue.json`, `.posthog-wizard-cache/.posthog-events.json`, and the step handoffs recorded during this run. No event delivery was inferred from a successful build.
