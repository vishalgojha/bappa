# Ganesh Radio

A small browser radio for Ganesh Chaturthi: Spotify Web Playback SDK for music, and ElevenLabs for Hindi/Hinglish announcements.

## Run locally

```bash
cp .env.example .env
# set SPOTIFY_CLIENT_ID, ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID
node --env-file=.env server.js
```

In Spotify Developer Dashboard add the exact redirect URI `http://localhost:3000/` (or your Coolify domain followed by `/`). Open the app, connect Spotify, paste Spotify track links/URIs, and start the evening.

The account playing music must have Spotify Premium because the Web Playback SDK requires it. PKCE is used so no Spotify client secret is needed in the browser. Keep the ElevenLabs key in Coolify environment variables only.

## Coolify / Hetzner

Create a resource from this repository, expose port `3000`, and add the three variables from `.env.example` in the application Environment Variables panel. Deploy, then add the HTTPS domain URL plus `/` to Spotify’s Redirect URI allowlist. The Dockerfile is ready for Coolify’s Dockerfile build pack.
