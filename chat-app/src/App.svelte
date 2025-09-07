
<script>
  import Chat from './Chat.svelte';
  import Header from './Header.svelte';
  import Profile from './Profile.svelte';
  import VideoChat from './VideoChat.svelte';
  import UserSearch from './UserSearch.svelte';
  import { username } from './user';
  let showProfile = false;
  let showVideoChat = false;

  function handleProfile() {
    showProfile = true;
    showVideoChat = false;
  }

  function handleShowVideoChat() {
    showVideoChat = !showVideoChat;
    showProfile = false;
  }
</script>

<div class="app">
  <Header on:profile={handleProfile} />
  <div class="main-content">
    {#if showProfile}
      <Profile />
    {:else if showVideoChat}
      <VideoChat />
    {:else}
      {#if $username}
        <div style="display: flex; flex-direction: row; height: 100%;">
          <div style="padding: 1rem; text-align: right; min-width: 250px; max-width: 350px;">
            <button on:click={handleShowVideoChat} style="padding: 0.5em 1.2em; border-radius: 8px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 600; cursor: pointer; margin-bottom: 1em;">Video Chat</button>
            <div style="margin-top: 1em;">
              <UserSearch />
            </div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <Chat />
          </div>
        </div>
      {:else}
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <Chat />
        </div>
      {/if}
  {/if}
  </div>
</div>

<style>
.app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>