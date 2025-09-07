
<script>
import Login from './Login.svelte';
import ChatMessage from './ChatMessage.svelte';
import { onMount } from 'svelte';
import { username, user } from './user';
import debounce from 'lodash.debounce';
import GUN from 'gun';

const db = GUN();
let newMessage;
let messages = [];
let scrollBottom;
let lastScrollTop;
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

$: debouncedWatchScroll = debounce(watchScroll, 1000);

onMount(() => {
  var match = {
    '.': {
      '>': new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString(),
    },
    '-': 1,
  };

  // This is the key part - listening for chat messages and decrypting them
  db.get('chat')
    .map(match)
    .once(async (data, id) => {
      if (data) {
        // Key for end-to-end encryption (same as used in sendMessage)
        const key = '#foo';
        
        // Get the username of the message sender
        const senderAlias = await db.user(data).get('alias');
        
        // Decrypt the message
        const decryptedMessage = await SEA.decrypt(data.what, key);
        
        var message = {
          who: senderAlias,
          what: decryptedMessage + '', // force as text
          when: GUN.state.is(data, 'what'), // get timestamp
        };
        
        // Only add valid messages
        if (message.what && message.what !== 'null' && message.what !== 'undefined') {
          messages = [...messages.slice(-100), message].sort((a, b) => a.when - b.when);
          if (canAutoScroll) {
            autoScroll();
          } else {
            unreadMessages = true;
          }
        }
      }
    });
});

async function sendMessage() {
  if (!newMessage?.trim()) return;
  
  // Encrypt the message with the shared key
  const secret = await SEA.encrypt(newMessage, '#foo');
  const message = user.get('all').set({ what: secret });
  const index = new Date().toISOString();
  
  // Store in the chat
  db.get('chat').get(index).put(message);
  
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
          {#if unreadMessages}💬{/if}
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

<style>
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  main {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  form {
    display: flex;
    padding: 1rem;
    background: #f5f5f5;
    border-top: 1px solid #ddd;
  }
  
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .scroll-button {
    position: fixed;
    bottom: 100px;
    right: 20px;
  }
  
  .scroll-button button {
    border-radius: 50%;
    width: 50px;
    height: 50px;
  }
  
  .scroll-button button.red {
    background: #ff4444;
  }
  
  .dummy {
    height: 1px;
  }
</style>