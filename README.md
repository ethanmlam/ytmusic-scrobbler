# YouTube Music Scrobbler

A Chrome extension that scrobbles YouTube Music plays to your own server, including repeat detection.

## Why?

- YouTube Music stats/history is in the ice age compared to all other providers (Spotify, Apple Music, etc)
- No official scrobbling API
- Incompatible with Last.fm 

This extension solves all three by detecting plays directly in the browser via `video.currentTime`.

## Features

- ✅ Detects song changes
- ✅ Detects repeats (same song played again)
- ✅ 30-second minimum play time (filters skips)
- ✅ Works with YouTube Music PWA
- ✅ Posts to your own API endpoint

## Setup

### 1. Configure your API endpoint

Edit `scrobbler.js` and change:
```javascript
const SCROBBLE_API = 'https://your-server.com/api/scrobble';
```

### 2. Install the extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

### 3. Set up your server

Your API endpoint should accept POST requests with:
```json
{
  "title": "Song Name",
  "artist": "Artist Name",
  "album": "",
  "played_at": "2026-02-22T12:00:00"
}
```

## How it works

1. Content script injects into `music.youtube.com`
2. Polls video player every 2 seconds
3. Detects track changes OR position resets (repeats)
4. After 30 seconds of play → POST to your API

## License

MIT
