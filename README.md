# **LiveLocation**

A fast, privacy-focused real-time location sharing app built with modern web technologies.

<br>

## **Features**

* 🔗 *Instant session links* for quick sharing
* 📍 *Real-time tracking* on an interactive map
* 🔒 *Session-scoped security* — trackers cannot write
* 📴 *No login required* — anonymous authentication
* 📱 *Mobile-first UI* optimized for real use
* 🚫 *Graceful session end* handling

<br>

## **Tech Stack**

**Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
**Maps:** MapLibre GL, MapTiler, Geolocation API
**Backend:** Firebase Realtime Database, Firebase Anonymous Auth
**Deployment:** Vercel

<br>

## **Project Structure**

```
src/
  app/
    share/
      [sessionId]/
    track/
      [sessionId]/
  components/
  lib/
  styles/
```

<br>

## **Local Development**

```bash
npm install
npm run dev
```

Add environment variables in `.env.local`:

```
NEXT_PUBLIC_MAPTILER_KEY=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
...
```

<br>

## **Security**

**Isolation:** Each session is a separate node
**Writes:** Allowed only to the sharer’s session
**Reads:** Trackers can only read, cannot overwrite
**Data Stored:** Only lat/lng + minimal metadata

<br>

## **Screens**

**Landing**, **Share**, **Track**, **Session End State**

<br>

## **Future Enhancements**

**Possible additions:** view count, route history, PIN-protected sessions

<br>

## **License**

MIT License.