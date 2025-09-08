
<script>
 export let message;
export let sender;

const normalize = v => (v || '').toString().trim().toLowerCase();
const messageClass = normalize(message.who) === normalize(sender) ? 'sent' : 'received';
// Use normalized sender for avatar seed for consistency
const avatarSeed = messageClass === 'sent' ? normalize(sender) : normalize(message.who);
const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(avatarSeed)}`;
const ts = new Date(message.when);
</script>

<div class={`message ${messageClass}`}>
<img src={avatar} alt="avatar" />
<div class="message-text">
<p>{message.what}</p>
<time>{ts.toLocaleTimeString()}</time>
</div>
</div>

<style>
.message {
  display: flex;
  align-items: flex-start;
  margin: 10px;
  gap: 8px;
}

.message.sent {
  flex-direction: row-reverse;
}

.message img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-text {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #f0f0f0;
}


.sent .message-text {
  background-color: #007bff;
  color: white;
}

.received .message-text {
  color: #111;
}

.message-text p {
  margin: 0 0 4px 0;
}

.message-text time {
  font-size: 0.75em;
  opacity: 0.7;
}
</style>