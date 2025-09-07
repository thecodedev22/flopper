<script>
  import { user, username } from './user';
  let newUsername = $username;
  let message = '';

  $: avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newUsername)}`;

  $: if ($username && newUsername !== $username) {
    message = '';
  }

  function updateProfile() {
    user.get('alias').put(newUsername, ack => {
      if (ack.err) {
        message = 'Error updating username.';
      } else {
        message = 'Profile updated!';
      }
    });
  }

  function goBack() {
    // Dispatch a custom event to parent to go back to chat
    const event = new CustomEvent('back', { bubbles: true });
    dispatchEvent(event);
  }
</script>

<div class="profile-container">
  <button class="back-btn" on:click={goBack} title="Back to chat">← Back</button>
  <div class="avatar-section">
    <img class="avatar-img" src={avatarUrl} alt="Avatar" />
    <h2 class="profile-title">Profile</h2>
  </div>
  <div class="profile-form">
    <label for="username">Username:</label>
    <input id="username" bind:value={newUsername} maxlength="16" />
    <button class="update-btn" on:click={updateProfile}>Update</button>
  </div>
  {#if message}
    <p class="profile-message">{message}</p>
  {/if}
</div>

<style>
.profile-container {
  max-width: 420px;
  margin: 3rem auto;
  padding: 2.5rem 2rem 2rem 2rem;
  background: rgba(255,255,255,0.15);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  color: #222;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
.avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  box-shadow: 0 2px 12px #0002;
  margin-bottom: 0.5rem;
  background: #fff;
}
.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: #764ba2;
  margin: 0.5rem 0 0 0;
}
.profile-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 1rem;
}
.profile-form label {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}
.profile-form input {
  padding: 0.75em 1em;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1.1em;
  background: rgba(255,255,255,0.7);
  color: #222;
}
.update-btn {
  padding: 0.75em 1.2em;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 0.5em;
  transition: background 0.2s;
}
.update-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
.profile-message {
  margin-top: 1em;
  color: #764ba2;
  text-align: center;
}
.back-btn {
  position: absolute;
  left: 1.5rem;
  top: 1.5rem;
  background: none;
  border: none;
  color: #764ba2;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #667eea;
}
</style>
