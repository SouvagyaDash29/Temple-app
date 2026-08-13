# Temple Devotee App — Setup

## 1. Install

```bash
npm install
# or, to let Expo pick compatible native-module versions:
npx expo install
```

If you're starting from scratch instead of using this folder as-is:

```bash
npx create-expo-app temple-app
cd temple-app
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install lucide-react-native
npx expo install expo-font @expo-google-fonts/noto-sans @expo-google-fonts/noto-serif expo-splash-screen
npx expo install @react-native-async-storage/async-storage expo-secure-store
npx expo install expo-notifications expo-device expo-constants
npx expo install expo-auth-session expo-web-browser expo-crypto
npx expo install @react-native-community/datetimepicker
```

Then copy the `src/`, `App.js` and `app.json` from this project over.

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in `EXPO_PUBLIC_API_URL` and the Google OAuth client IDs (see below).

## 3. Run

```bash
npx expo start
```

Scan the QR with Expo Go for a quick look. **Push notifications and Google
Sign-In need a dev build** (Expo Go can't host custom native OAuth
redirects or full remote push):

```bash
npx expo install expo-dev-client
eas login
eas build:configure
eas build --profile development --platform ios      # or android
```

## 4. Google Calendar sync setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **APIs & Services → OAuth consent screen** → configure it, add scope
   `https://www.googleapis.com/auth/calendar.events`.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - **Web application** — add redirect URI `https://auth.expo.io/@your-expo-username/temple-devotee-app`
     (or your custom scheme redirect once you have a dev build: `templeapp://`).
   - **iOS** — bundle ID must match `app.json`'s `ios.bundleIdentifier`.
   - **Android** — package name must match `app.json`'s `android.package`, plus your SHA-1 signing cert.
5. Paste the three client IDs into `.env`.

The flow is already wired in `src/services/googleCalendarService.js` and
`src/hooks/useGoogleCalendar.js` — call `useGoogleCalendar().connect()` from
a Profile/Preferences screen to trigger it.

## 5. Push notifications setup

1. `eas init` to create/link an EAS project, then put the project ID into
   `app.json` → `expo.extra.eas.projectId`.
2. Local reminders (event reminders scheduled on-device) work immediately —
   no extra setup, see `services/notificationService.js`.
3. For **remote** push (e.g. a server-triggered "Special Aarti today" blast),
   send the token captured by `usePushNotifications()` to your backend and
   use the [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/).

## 6. Backend contract this app expects

`src/services/calendarApi.js` assumes these endpoints exist:

- `GET /calendar?year=&month=` → `{ eventsByDate: { 'YYYY-MM-DD': ['festival','personal'] } }`
- `GET /calendar/day/:dateKey` → `{ observances: string[], events: Event[] }`
- `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
- `GET /me`, `GET /me/preferences`, `PATCH /me/preferences`

Swap the `BASE_URL` in `apiClient.js` and adjust `calendarApi.js` to match
your real backend once it exists.

## Project structure

```
src/
  constants/    design tokens: colors, typography, spacing, layout, eventTypes
  theme/        semantic theme (dark-mode-ready) + ThemeContext/useTheme()
  utils/        date helpers, responsive scaling
  components/   reusable UI (Button, Card, EventCard, CalendarGrid, ...)
  services/     apiClient, calendarApi, notificationService, googleCalendarService, storage
  hooks/        useCalendarMonth, useDayDetails, useEvents, usePushNotifications, useGoogleCalendar
  screens/      Splash, Onboarding, Login, Calendar, AddEvent
  navigation/   RootNavigator (bottom tabs + stack)
```
