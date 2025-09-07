
<script>
  import Chat from './Chat.svelte';
  import Header from './Header.svelte';
  import Profile from './Profile.svelte';
  let showProfile = false;

  function handleProfile() {
    showProfile = true;
  }
</script>

<div class="app">
  <Header on:profile={handleProfile} />
  <div class="main-content">
    {#if showProfile}
      <Profile />
    {:else}
      <Chat />
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