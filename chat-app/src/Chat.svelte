<script>
import Login from './Login.svelte';
import ChatMessage from './Chatmessage.svelte';
import { onMount } from 'svelte';
import { username, user } from './user';
import debounce from 'lodash.debounce';
import GUN from 'gun';

const db = GUN();
let newMessage = '';
let messages = [];
let scrollBottom;
let lastScrollTop = 0;
let canAutoScroll = true;
let unreadMessages = false;

function autoScroll() {
  setTimeout(() => scrollBottom?.scrollIntoView({ behavior: 'auto' }), 50);
  unreadMessages = false;
}

function watchScroll(e) {
  canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
  lastScrollTop = e.target.scrollTop;
}

const debouncedWatchScroll = debounce(watchScroll, 1000);

onMount(() => {
  // Example: Load messages from GUN (simplified, real implementation may differ)
  db.get('chat').map().on((data, id) => {
    if (data && data.what) {
      const message = {
        who: data.who,
        what: data.what,
        when: data.when || Date.now(),
      };
      messages = [...messages.filter(m => m.when !== message.when), message].sort((a, b) => a.when - b.when);
      if (canAutoScroll) {
        autoScroll();
      } else {
        unreadMessages = true;
      }
    }
  });
});

async function sendMessage() {
  if (!newMessage) return;
  const message = {
    who: $username,
    what: newMessage,
    when: Date.now(),
  };
  db.get('chat').set(message);
  newMessage = '';
  canAutoScroll = true;
  autoScroll();
}
</script>

<div class="container">
  {#if $username}
    <main on:scroll={debouncedWatchScroll}>
      {#each messages as message (message.when)}
        <ChatMessage {message} sender={$username} />
      {/each}
      <div class="dummy" bind:this={scrollBottom} />
    </main>
    <form on:submit|preventDefault={sendMessage}>
      <input type="text" placeholder="Type a message..." bind:value={newMessage} maxlength="100" />
      <button type="submit" disabled={!newMessage}>💥</button>
    </form>
    {#if !canAutoScroll}
      <div class="scroll-button">
        <button on:click={autoScroll} class:red={unreadMessages}>
          {#if unreadMessages}
            💬
          {/if}
          👇
        </button>
      </div>
    {/if}
  {:else}
    <main>
      <Login />
    </main>
  {/if}
</div>
