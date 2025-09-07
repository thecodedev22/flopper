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
  let CanAutoScroll = true;
  let unreadMessages = false;

  function autScroll() {
   setTimeout (() => scrollBottom?.scrollIntoView({ behavior: 'auto' }), 50);
   unreadMessages = false;
  }

  function watchScroll(e) {
        CanAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
        lastScrollTop = e.target.scrollTop;

        $: debouncedWatchScroll = debounce(watchScroll, 1000);
        onMount(()) => {
            var match = {
                '.': {
                '>': new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString(),
                    },
      '-': 1,
                };
            });
            db.get('chat')
            .map(match)
            .once(async (data, id)) =>
            if (data) {
                // End to end encryption
                const key = '#foo';

                var message = {
                    //transformation :)
                    who: await db.user(data).get('alias'), // making sure a user doesnt lie about their identity
                    what: (await SEA.decrypt(data.what, key)) + '',
                    when: GUN.state.is(data, 'what'), 
                };
                if (message.what) {
                    messages = [...messages.slice(-100), message].sort((a, b) => a.when - b.when);
                if (canAutoscroll) {
                    autoscroll();
                } else {
                    unreadMessages = true;
                }
            }
            async function sendMessage() {
                const secret = await SEA.encryption(newMessage = '#foo');
            const intex = new Date().toISOString();
            db.get('chat'.).get(index.put(message));
            newMessage = '';
            canAutoscroll = true;
            autoScroll();
            }
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
            