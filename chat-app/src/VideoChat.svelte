
<script>
  import { initializeApp } from 'firebase/app';
  import { getDatabase, ref, set, onValue, push, remove, onChildAdded } from 'firebase/database';

  let localStream = null;
  let darkMode = false;
  let remoteStream = null;
  let peerConnection = null;
  let localVideo;
  let remoteVideo;
  let isStarted = false;
  let room = '';
  let createdRoom = '';
  let connected = false;
  let isOfferer = false;
  let canJoin = false;
function generateRoomName() {
  return Math.random().toString(36).substring(2, 10);
}

function createRoom() {
  if (!room) {
    room = generateRoomName();
  }
  createdRoom = room;
  canJoin = true;
}

$: canJoin = !!room;

function copyRoom() {
  navigator.clipboard.writeText(createdRoom);
}

  const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAFdtad6gXot4ZyOOc7S8R4d1-pHSmtXKs",
    authDomain: "flopper-b52da.firebaseapp.com",
    projectId: "flopper-b52da",
    storageBucket: "flopper-b52da.firebasestorage.app",
    messagingSenderId: "380098975873",
    appId: "1:380098975873:web:b7697a4c224aba2b6c1580",
    measurementId: "G-P2CCPYFSEY"
  };
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  function getRoomRef() {
    return ref(db, 'videochat/' + room);
  }

  async function start() {
    if (!room) {
      alert('Please enter a room name.');
      return;
    }
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    isStarted = true;
    peerConnection = new RTCPeerConnection(servers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    remoteStream = new MediaStream();
    peerConnection.ontrack = event => {
      event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
      remoteVideo.srcObject = remoteStream;
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        const candidatesRef = ref(db, `videochat/${room}/candidates`);
        push(candidatesRef, JSON.stringify(event.candidate));
      }
    };

    // Listen for remote offer/answer/candidates
    const offerRef = ref(db, `videochat/${room}/offer`);
    const answerRef = ref(db, `videochat/${room}/answer`);
    const candidatesRef = ref(db, `videochat/${room}/candidates`);

    onValue(offerRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data || connected) return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      set(answerRef, JSON.stringify(answer));
      connected = true;
    });

    onValue(answerRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data || connected) return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
      connected = true;
    });

    onChildAdded(candidatesRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(data)));
      } catch (e) {}
    });

    // If first to join, create offer
    onValue(offerRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        isOfferer = true;
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        set(offerRef, JSON.stringify(offer));
      }
    }, { onlyOnce: true });
  }

  function stop() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      remoteStream = null;
    }
    // Clean up Firebase room
    if (room) {
      const roomRef = ref(db, `videochat/${room}`);
      remove(roomRef);
    }
    isStarted = false;
    connected = false;
    isOfferer = false;
  }
</script>

<main class="video-chat" class:dark-mode={darkMode}>
  <div class="videochat-header">
    <h2>Video Chat</h2>
    <button class="dark-toggle" on:click={() => darkMode = !darkMode} aria-label="Toggle dark mode">
      {darkMode ? '🌙' : '☀️'}
    </button>
  </div>
  <div class="room-input">
    <input placeholder="Room name" bind:value={room} disabled={isStarted} />
    <button on:click={createRoom} disabled={isStarted}>Create Room</button>
    {#if createdRoom}
      <div class="created-room">
        <span>Room: <b>{createdRoom}</b></span>
        <button on:click={copyRoom}>Copy</button>
      </div>
    {/if}
    <button on:click={start} disabled={isStarted || !canJoin}>Join Room</button>
    <button on:click={stop} disabled={!isStarted}>Leave Room</button>
  </div>
  <div class="videos">
    <div>
      <h3>Local</h3>
      <video bind:this={localVideo} autoplay playsinline muted width="320" height="240"></video>
    </div>
    <div>
      <h3>Remote</h3>
      <!-- svelte-ignore a11y_media_has_caption -->
      <video bind:this={remoteVideo} autoplay playsinline width="320" height="240"></video>
    </div>
  </div>
</main>

<style>
:root {
  --bg: #f7f7fa;
  --fg: #181a20;
  --panel: #fff;
  --border: #e5e7eb;
  --accent: #667eea;
  --input-bg: #f0f1f5;
  --input-fg: #222;
}
.dark-mode {
  --bg: #181a20;
  --fg: #f7f7fa;
  --panel: #23262f;
  --border: #333646;
  --accent: #a5b4fc;
  --input-bg: #23262f;
  --input-fg: #f7f7fa;
}
.video-chat {
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}
.videochat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1rem;
}
.dark-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--fg);
  margin-left: 0.5rem;
}
.room-input {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.room-input input {
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  background: var(--input-bg);
  color: var(--input-fg);
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
  transition: border 0.2s;
}
.room-input input:focus {
  border-color: var(--accent);
}
.room-input button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  margin: 0.25rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.room-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.created-room {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.videos {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}
video {
  border: 2px solid var(--border);
  border-radius: 8px;
  background: #222;
}
h2, h3 {
  color: var(--fg);
}
</style>
