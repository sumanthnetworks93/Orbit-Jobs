# Orbit

Discover startups and jobs — iOS React Native app with Firebase Auth and a C# ASP.NET Core API.

## Project structure

```
orbit-mobile/     Expo React Native app (iOS)
orbit-backend/    ASP.NET Core 8 Web API (C#)
```

## Screens (from design)

- **Auth** — Apple, Google, LinkedIn, GitHub sign-in with soft blob background
- **Startups** — trending feed with upvotes and emoji scatter background
- **Jobs** — role listings with apply buttons

## 1. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Add an **iOS app** with bundle ID `com.orbit.app`.
3. Enable Authentication providers:
   - Apple (iOS)
   - Google
   - Anonymous (for LinkedIn/GitHub demo until custom OAuth is wired)
   - GitHub (optional)
4. Copy your web app config into `orbit-mobile/.env` (see `.env.example`).

```bash
cd orbit-mobile
cp .env.example .env
# fill in EXPO_PUBLIC_FIREBASE_* values
```

5. For the C# API, download a service account JSON and set in `orbit-backend/appsettings.Development.json`:

```json
"Firebase": {
  "ProjectId": "your-project-id",
  "CredentialsPath": "C:/path/to/serviceAccount.json"
}
```

Leave `ProjectId` empty for local dev — the API accepts any Bearer token as `dev-user`.

## 2. Run the C# backend

```bash
cd orbit-backend
dotnet run
```

API: `http://localhost:5189`

- `GET /health`
- `GET /api/startups`
- `GET /api/jobs`
- `POST /api/startups/{id}/upvote` (requires `Authorization: Bearer <firebase-id-token>`)

## 3. Run the iOS app

Requires a Mac with Xcode for the iOS simulator, or use Expo Go on a physical iPhone.

```bash
cd orbit-mobile
npm install
npm run ios
```

On Windows, start the dev server and scan the QR code with Expo Go on your iPhone:

```bash
npm start
```

Set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (not `localhost`) when testing on a physical device, e.g. `http://192.168.1.10:5189`.

## Auth notes

| Provider  | Status |
|-----------|--------|
| Apple     | Native via `expo-apple-authentication` on iOS |
| Google    | OAuth via `expo-auth-session` + Firebase credential |
| LinkedIn  | UI ready — uses anonymous auth until custom OAuth backend is added |
| GitHub    | UI ready — uses anonymous auth in dev; enable GitHub in Firebase for web |

## Background themes

The design includes five decorative backgrounds (`blobs`, `emoji`, `dots`, `doodle`, `rings`). Auth uses **blobs**; feed screens use **emoji** scatter, matching the Orbit Backgrounds design file.
