# Artify 🎧

A modern, Spotify-style music streaming web app with its own identity and logo.

## Features
- **Free, legal, full-length streaming** from [Audius](https://audius.co), an open platform where artists upload and share their own music. New tracks show up every day.
- **Charts that refresh daily**: Trending this week, Fresh finds (rising artists), All-time hits, Popular playlists. Results are cached per day, so the app stays fast and still shows the last-loaded charts when you're offline.
- **Search** for songs and playlists, plus **Browse by genre** (week / month / all-time charts).
- **Offline Library**: import your own MP3/M4A/FLAC/WAV/OGG files (drag & drop). They're stored on your device in IndexedDB at their original quality and play with **no internet**.
- **Installable PWA**: a service worker caches the app shell, so Artify opens offline.
- Liked Songs, your own playlists (create, rename, delete, add/remove tracks), Recently played.
- A full player: play/pause, next/previous, shuffle, repeat (all/one), seek with buffer indicator, volume/mute, a queue (play next, add to queue, remove), a sleep timer, and the next track preloads for smooth transitions.
- Lock-screen and headphone controls through the Media Session API.
- No ads, a responsive layout, and a mobile bottom nav.

### Keyboard shortcuts
`Space` play/pause · `Shift+→/←` next/prev · `↑/↓` volume · `M` mute · `S` shuffle · `R` repeat · `Q` queue · `/` search

## 📱 Android app (APK)
Each push runs **GitHub Actions** (`.github/workflows/android-release.yml`), which builds the Android app with Capacitor and posts **`Artify.apk`** to the repo's **Releases** page.
To install it, download `Artify.apk` from the latest release on your phone, open it, and allow "Install unknown apps" when Android asks.

To build it yourself, you need Android Studio / the Android SDK and Java 21:
```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug   # → app/build/outputs/apk/debug/app-debug.apk
```

## Offline listening
- **Downloads**: if an artist allows downloads on Audius, choose ⋯ → *Download for offline*. The file is saved on your device and plays with no network.
- **Your own files**: use Offline Library → *Import music* to add MP3/FLAC/etc. you own. They play fully offline.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build && npm run preview   # production build with offline support
```

## About Spotify's catalog
Artify does **not** copy, scrape, or redistribute Spotify's music. Those recordings are owned by labels and artists and licensed only to Spotify. To add mainstream catalog legally, you'd have to license it (as streaming services do), or link out with the official Spotify Web API / Web Playback SDK, which needs Spotify login and Premium and follows Spotify's terms.
