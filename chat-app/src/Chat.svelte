<script>
import Login from './Login.svelte';
import ChatMessage from './ChatMessage.svelte';
import { onMount } from 'svelte';
import { username, user } from './user';
import debounce from 'lodash.debounce';
import GUN from 'gun';
import SEA from 'gun/sea';

const db = GUN();
let newMessage;
let messages = [];
let scrollBottom;
let lastScrollTop;
let canAutoScroll = true;
let unreadMessages = false;
let messagesContainer;
let isTyping = false;

function autoScroll() {
  setTimeout(() => scrollBottom?.scrollIntoView({ behavior: 'smooth' }), 50);
  unreadMessages = false;
}

function watchScroll(e) {
  canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
  lastScrollTop = e.target.scrollTop;
}

$: debouncedWatchScroll = debounce(watchScroll, 1000);

// Handle typing indicator
function handleTyping() {
  if (newMessage && !isTyping) {
    isTyping = true;
    setTimeout(() => isTyping = false, 2000);
  }
}

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

// Handle keyboard shortcuts
function handleKeyDown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    sendMessage();
  }
  handleTyping();
}
</script>

<div class="chat-container">
  {#if $username}
    <header class="chat-header">
      <div class="header-content">
        <div class="chat-info">
          <div class="status-dot"></div>
          <div>
            <h2 class="chat-title">General Chat</h2>
            <p class="chat-subtitle">{messages.length} messages • End-to-end encrypted</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" title="Search messages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="messages-container" bind:this={messagesContainer} on:scroll={debouncedWatchScroll}>
      <div class="messages-list">
        {#if messages.length === 0}
          <div class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Be the first to start the conversation!</p>
          </div>
        {/if}
        
        {#each messages as message (message.when)}
          <ChatMessage {message} sender={$username} />
        {/each}
        
        {#if isTyping && newMessage}
          <div class="typing-indicator">
            <div class="typing-bubble">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        {/if}
        
        <div class="scroll-anchor" bind:this={scrollBottom}></div>
      </div>
    </main>
    
    <footer class="message-form-container">
      <form class="message-form" on:submit|preventDefault={sendMessage}>
        <div class="input-container">
          <div class="input-wrapper">
            <input 
              type="text" 
              placeholder="Type your message..." 
              bind:value={newMessage} 
              on:keydown={handleKeyDown}
              maxlength="500"
              class="message-input"
              autocomplete="off"
            />
            <div class="input-actions">
              <button 
                type="button" 
                class="emoji-btn" 
                title="Add emoji"
              >
                😊
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!newMessage?.trim()} 
            class="send-button"
            title="Send message (Ctrl+Enter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
          </button>
        </div>
        <div class="input-footer">
          <div class="char-count" class:warning={newMessage?.length > 400}>
            {newMessage?.length || 0}/500
          </div>
          <div class="shortcuts">
            <span class="shortcut">Ctrl+Enter to send</span>
          </div>
        </div>
      </form>
    </footer>
    
    {#if !canAutoScroll && unreadMessages}
      <div class="scroll-button-container">
        <button class="scroll-button new-messages" on:click={autoScroll}>
          <div class="scroll-content">
            <span class="unread-count">New</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
        </button>
      </div>
    {:else if !canAutoScroll}
      <div class="scroll-button-container">
        <button class="scroll-button" on:click={autoScroll}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
      </div>
    {/if}
  {:else}
    <main class="login-container">
      <Login />
    </main>
  {/if}
</div>

<style>
  /* CSS Variables for consistent theming */
  :root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --surface-glass: rgba(255, 255, 255, 0.1);
    --surface-glass-hover: rgba(255, 255, 255, 0.15);
    --border-glass: rgba(255, 255, 255, 0.2);
    --text-primary: white;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --text-tertiary: rgba(255, 255, 255, 0.6);
    --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 12px 40px rgba(0, 0, 0, 0.15);
    --border-radius: 16px;
    --border-radius-large: 24px;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
  }

  /* Reset and base styles */
  * {
    box-sizing: border-box;
  }

  .chat-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    background: var(--primary-gradient);
    position: relative;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* Chat Header */
  .chat-header {
    background: var(--surface-glass);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-glass);
    padding: var(--spacing-md) var(--spacing-lg);
    flex-shrink: 0;
    box-shadow: var(--shadow-soft);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .chat-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .status-dot {
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  .chat-title {
    color: var(--text-primary);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.4;
  }

  .chat-subtitle {
    color: var(--text-tertiary);
    font-size: 0.875rem;
    margin: 0;
    font-weight: 400;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .action-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--surface-glass);
    border: 1px solid var(--border-glass);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: var(--surface-glass-hover);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  /* Messages container */
  .messages-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    scroll-behavior: smooth;
  }

  .messages-list {
    padding: var(--spacing-lg);
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    color: var(--text-secondary);
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
  }

  .empty-icon {
    font-size: 4rem;
    opacity: 0.6;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .empty-state p {
    margin: 0;
    font-size: 1rem;
  }

  .typing-indicator {
    display: flex;
    justify-content: flex-start;
    margin-bottom: var(--spacing-sm);
  }

  .typing-bubble {
    background: var(--surface-glass);
    backdrop-filter: blur(10px);
    border-radius: 18px;
    padding: var(--spacing-md);
    border: 1px solid var(--border-glass);
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .scroll-anchor {
    height: 1px;
    width: 1px;
    opacity: 0;
  }

  /* Login container */
  .login-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  }

  /* Message form */
  .message-form-container {
    background: var(--surface-glass);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-glass);
    padding: var(--spacing-lg);
    flex-shrink: 0;
  }

  .message-form {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .input-container {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-end;
    margin-bottom: var(--spacing-sm);
  }

  .input-wrapper {
    flex: 1;
    position: relative;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--border-radius-large);
    border: 1px solid var(--border-glass);
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  }

  .input-wrapper:focus-within {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .message-input {
    flex: 1;
    padding: 1rem 1.25rem;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #333;
    outline: none;
    font-family: inherit;
    line-height: 1.5;
    resize: none;
  }

  .message-input::placeholder {
    color: #666;
  }

  .input-actions {
    display: flex;
    align-items: center;
    padding-right: var(--spacing-md);
  }

  .emoji-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .emoji-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .send-button {
    width: 52px;
    height: 52px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: var(--shadow-soft);
  }

  .send-button:hover:not(:disabled) {
    transform: scale(1.05) translateY(-2px);
    box-shadow: var(--shadow-medium);
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .send-button:disabled {
    background: var(--surface-glass);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: var(--spacing-xs);
    padding: 0 var(--spacing-xs);
  }

  .char-count.warning {
    color: #fbbf24;
  }

  .shortcuts {
    display: flex;
    gap: var(--spacing-md);
  }

  .shortcut {
    opacity: 0.7;
  }

  /* Scroll button */
  .scroll-button-container {
    position: fixed;
    bottom: calc(140px + var(--spacing-lg));
    right: var(--spacing-lg);
    z-index: 100;
  }

  .scroll-button {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid var(--border-glass);
    background: var(--surface-glass);
    backdrop-filter: blur(20px);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-medium);
    transition: all 0.2s ease;
  }

  .scroll-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
    background: var(--surface-glass-hover);
  }

  .scroll-button.new-messages {
    background: #ef4444;
    color: white;
    border-color: rgba(239, 68, 68, 0.3);
    animation: newMessage 2s ease-in-out infinite;
  }

  @keyframes newMessage {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .scroll-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .unread-count {
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .chat-header {
      padding: var(--spacing-md);
    }
    
    .header-actions {
      display: none;
    }
    
    .messages-list {
      padding: var(--spacing-md);
      gap: var(--spacing-md);
    }
    
    .message-form-container {
      padding: var(--spacing-md);
    }
    
    .input-container {
      gap: var(--spacing-sm);
    }
    
    .message-input {
      font-size: 16px; /* Prevents zoom on iOS */
      padding: 0.875rem var(--spacing-md);
    }
    
    .send-button {
      width: 48px;
      height: 48px;
    }
    
    .scroll-button-container {
      bottom: calc(120px + var(--spacing-md));
      right: var(--spacing-md);
    }
    
    .scroll-button {
      width: 48px;
      height: 48px;
    }
    
    .shortcuts {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .chat-title {
      font-size: 1rem;
    }
    
    .chat-subtitle {
      font-size: 0.8125rem;
    }
    
    .messages-list {
      padding: var(--spacing-sm);
    }
    
    .message-form-container {
      padding: var(--spacing-sm);
    }
    
    .send-button {
      width: 44px;
      height: 44px;
    }
  }

  /* Landscape mobile optimization */
  @media (max-height: 480px) and (orientation: landscape) {
    .chat-header {
      padding: var(--spacing-sm) var(--spacing-md);
    }
    
    .messages-list {
      padding: var(--spacing-sm);
    }
    
    .message-form-container {
      padding: var(--spacing-sm) var(--spacing-md);
    }
    
    .scroll-button-container {
      bottom: calc(80px + var(--spacing-sm));
    }
  }

  /* Large screens */
  @media (min-width: 1200px) {
    .scroll-button-container {
      right: calc((100vw - 1200px) / 2 + var(--spacing-lg));
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .input-wrapper {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .message-input {
      color: white;
    }
    
    .message-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .send-button, .scroll-button, .action-btn {
      transition: none;
    }
    
    .scroll-button.new-messages {
      animation: none;
    }
    
    .status-dot {
      animation: none;
    }
    
    .typing-dots span {
      animation: none;
    }
    
    .scroll-anchor {
      scroll-behavior: auto;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .action-btn, .scroll-button {
      border-width: 2px;
    }
    
    .input-wrapper {
      border-width: 2px;
    }
  }

  /* Focus visible for accessibility */
  .send-button:focus-visible,
  .action-btn:focus-visible,
  .scroll-button:focus-visible,
  .emoji-btn:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }

  .message-input:focus-visible {
    outline: none; /* Handled by input-wrapper focus-within */
  }
</style>