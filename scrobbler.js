// YTMusic Scrobbler - Content Script
const SCROBBLE_API = 'https://instance-20260128-1952.tail3f881b.ts.net/dashboard/api/ytmusic/scrobble';
const MIN_PLAY_TIME = 30; // seconds

let currentTrack = null;
let playStartTime = null;
let lastPosition = 0;
let scrobbled = false;

function getTrackInfo() {
  const titleEl = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-player-bar');
  const artistEl = document.querySelector('yt-formatted-string.byline.style-scope.ytmusic-player-bar a');
  
  if (titleEl && artistEl) {
    return {
      title: titleEl.textContent.trim(),
      artist: artistEl.textContent.trim(),
      album: ''
    };
  }
  return null;
}

function scrobble(track) {
  const data = {
    title: track.title,
    artist: track.artist,
    album: track.album,
    played_at: new Date().toISOString().slice(0, 19)
  };
  
  fetch(SCROBBLE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(res => console.log('[Scrobbler] Scrobbled:', track.title))
  .catch(err => console.error('[Scrobbler] Error:', err));
}

function checkVideo() {
  const video = document.querySelector('video');
  if (!video) return;
  
  const track = getTrackInfo();
  if (!track) return;
  
  const trackKey = track.title + '|' + track.artist;
  const currentKey = currentTrack ? (currentTrack.title + '|' + currentTrack.artist) : null;
  
  // Detect track change OR repeat (position reset)
  const positionReset = video.currentTime < lastPosition - 5; // Jumped back more than 5 sec
  const trackChanged = trackKey !== currentKey;
  
  if (trackChanged || positionReset) {
    // Scrobble previous track if played long enough
    if (currentTrack && playStartTime && !scrobbled) {
      const playTime = (Date.now() - playStartTime) / 1000;
      if (playTime >= MIN_PLAY_TIME) {
        scrobble(currentTrack);
      }
    }
    
    // Start tracking new/repeated track
    currentTrack = track;
    playStartTime = Date.now();
    scrobbled = false;
    console.log('[Scrobbler] Now playing:', track.title, '-', track.artist);
  }
  
  // Also scrobble if we've been playing for 30+ sec and haven't scrobbled yet
  if (currentTrack && playStartTime && !scrobbled && !video.paused) {
    const playTime = (Date.now() - playStartTime) / 1000;
    if (playTime >= MIN_PLAY_TIME) {
      scrobble(currentTrack);
      scrobbled = true;
    }
  }
  
  lastPosition = video.currentTime;
}

// Check every 2 seconds
setInterval(checkVideo, 2000);

console.log('[Scrobbler] YouTube Music Scrobbler loaded!');
