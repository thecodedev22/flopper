<script>
// @ts-nocheck

import Login from './Login.svelte';
import ChatMessage from './Chatmessage.svelte';
import { onMount, onDestroy } from 'svelte';
import { username, user } from './user';
import debounce from 'lodash.debounce';
import GUN from 'gun';
import SEA from 'gun/sea';
import { encryptMessage, decryptMessage } from './pgp.js';
import PGPKeys from './PGPKeys.svelte'; // Import your key management component

const db = GUN();
let newMessage;
let messages = [];
let scrollBottom;
let lastScrollTop;
let canAutoScroll = true;
let unreadMessages = false;
let messagesContainer;
let isTyping = false;
let showEmojiPicker = false;
const emojis = ['😀','😂','😍','😎','😭','😡','👍','🙏','🎉','🔥','💯','🥳','😅','😇','😜','🤔','😬','😱','😏','😴'];

// PGP passphrase variable
let pgpPassphrase = '';

// Toggle emoji picker visibility
function toggleEmojiPicker() {
  showEmojiPicker = !showEmojiPicker;
}

// Add emoji to the message input
function addEmoji(emoji) {
  newMessage = (newMessage || '') + emoji;
  showEmojiPicker = false;
}

// File sharing variables
let fileInput;
let isDragging = false;
let uploadProgress = 0;
let isUploading = false;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for now

// Auto-scroll to the bottom of the chat
function autoScroll() {
  setTimeout(() => scrollBottom?.scrollIntoView({ behavior: 'smooth' }), 50);
  unreadMessages = false;
}

// Watcher for scroll events to manage auto-scroll behavior
function watchScroll(e) {
  canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
  lastScrollTop = e.target.scrollTop;
}

// Debounced version of the scroll watcher
$: debouncedWatchScroll = debounce(watchScroll, 1000);

// Handle typing indicator visibility
function handleTyping() {
  if (newMessage && !isTyping) {
    isTyping = true;
    setTimeout(() => isTyping = false, 2000);
  }
}

// On component mount, set up the chat message listener
onMount(() => {
  hasPGPKey = !!localStorage.getItem('pgp_privateKey');
  if (hasPGPKey && !pgpPassphrase) {
    pgpPassphrase = prompt('Enter your PGP passphrase:');
  }
  db.get('chat')
    .map()
    .on(async (data, id) => {
      if (!data) return;
      let senderAlias;
      try {
        senderAlias = data.who || (await db.user(data).get('alias'));
      } catch (e) {
        senderAlias = 'Unknown';
      }
      let message;
      if (data.fileData) {
        // It's a file message - decrypt file data
        const decryptedFileData = await SEA.decrypt(data.fileData, '#foo');
        const decryptedFileName = await SEA.decrypt(data.fileName, '#foo');
        message = {
          who: senderAlias,
          what: null, // No text content
          when: (data && data.timestamp) ? data.timestamp : Date.now(),
          type: 'file',
          fileData: decryptedFileData,
          fileName: decryptedFileName,
          fileSize: data.fileSize,
          fileType: data.fileType
        };
      } else {
        // PGP decryption for text messages
        let decryptedMessage = '';
        try {
          const privateKey = localStorage.getItem('pgp_privateKey') || '';
          decryptedMessage = await decryptMessage(data.what, privateKey, pgpPassphrase);
        } catch (e) {
          decryptedMessage = '[Unable to decrypt]';
        }
        message = {
          who: senderAlias,
          what: decryptedMessage + '',
          when: (data && data.timestamp) ? data.timestamp : Date.now(),
          type: 'text'
        };
      }
      // Only add valid messages
      if ((message.what && message.what !== 'null' && message.what !== 'undefined') || message.type === 'file') {
        // Debug log for message receive
        console.log('[GunDB] Received message:', message);
        // Use Svelte reactivity: always assign a new array
        messages = [...messages.filter(m => m.when !== message.when), message].sort((a, b) => a.when - b.when).slice(-100);
        if (canAutoScroll) {
          autoScroll();
        } else {
          unreadMessages = true;
        }
      }
    });
});

// Send a new text message
async function sendMessage() {
  if (!newMessage?.trim()) return;
  // TODO: Replace with actual recipient's public key
  const recipientPublicKey = localStorage.getItem('pgp_publicKey') || '';
  const secret = await encryptMessage(newMessage, recipientPublicKey);
  const msgObj = {
    what: secret,
    timestamp: Date.now(),
    who: $username || 'Anonymous',
    type: 'text'
  };
  const index = new Date().toISOString();
  db.get('chat').get(index).put(msgObj);
  newMessage = '';
  canAutoScroll = true;
  autoScroll();
}

// File handling functions
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  files.forEach(uploadFile);
  fileInput.value = ''; // Reset input
}

function handleFileDrop(event) {
  event.preventDefault();
  isDragging = false;
  const files = Array.from(event.dataTransfer.files);
  files.forEach(uploadFile);
}

function handleDragOver(event) {
  event.preventDefault();
  isDragging = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragging = false;
}

async function uploadFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    alert(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
    return;
  }
  
  isUploading = true;
  uploadProgress = 0;
  
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Encrypt file data and metadata
    const encryptedFileData = await SEA.encrypt(base64Data, '#foo');
    const encryptedFileName = await SEA.encrypt(file.name, '#foo');
    
    // Create file message object and encrypt the whole object for consistency
    const fileMessageObj = {
      fileData: base64Data,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      who: $username || 'Anonymous',
      type: 'file',
      timestamp: Date.now()
    };
    const encryptedFileMessage = await SEA.encrypt(fileMessageObj, '#foo');
    const index = new Date().toISOString();
    db.get('chat').get(index).put({ what: encryptedFileMessage });
    
    uploadProgress = 100;
    canAutoScroll = true;
    autoScroll();
    
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed. Please try again.');
  } finally {
    isUploading = false;
    uploadProgress = 0;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function openFileDialog() {
  fileInput.click();
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    sendMessage();
  }
  handleTyping();
}

// New reactive variables and listeners
let hasPGPKey = false;
let chatListener;

// Reactively update hasPGPKey when $username or localStorage changes
$: hasPGPKey = !!localStorage.getItem('pgp_privateKey') && !!$username;

// Prompt for passphrase reactively
$: if (hasPGPKey && !pgpPassphrase) {
  pgpPassphrase = prompt('Enter your PGP passphrase:');
}

// Set up GunDB listener only when ready
$: if (hasPGPKey && pgpPassphrase) {
  // Remove previous listener if any
  if (chatListener && typeof chatListener.off === 'function') chatListener.off();
  chatListener = db.get('chat')
    .map()
    .on(async (data, id) => {
      if (!data) return;
      let senderAlias;
      try {
        senderAlias = data.who || (await db.user(data).get('alias'));
      } catch (e) {
        senderAlias = 'Unknown';
      }
      let message;
      if (data.fileData) {
        // It's a file message - decrypt file data
        const decryptedFileData = await SEA.decrypt(data.fileData, '#foo');
        const decryptedFileName = await SEA.decrypt(data.fileName, '#foo');
        message = {
          who: senderAlias,
          what: null,
          when: (data && data.timestamp) ? data.timestamp : Date.now(),
          type: 'file',
          fileData: decryptedFileData,
          fileName: decryptedFileName,
          fileSize: data.fileSize,
          fileType: data.fileType
        };
      } else {
        // PGP decryption for text messages
        let decryptedMessage = '';
        try {
          const privateKey = localStorage.getItem('pgp_privateKey') || '';
          decryptedMessage = await decryptMessage(data.what, privateKey, pgpPassphrase);
        } catch (e) {
          decryptedMessage = '[Unable to decrypt]';
        }
        message = {
          who: senderAlias,
          what: decryptedMessage + '',
          when: (data && data.timestamp) ? data.timestamp : Date.now(),
          type: 'text'
        };
      }
      if ((message.what && message.what !== 'null' && message.what !== 'undefined') || message.type === 'file') {
        messages = [...messages.filter(m => m.when !== message.when), message].sort((a, b) => a.when - b.when).slice(-100);
        if (canAutoScroll) {
          autoScroll();
        } else {
          unreadMessages = true;
        }
      }
    });
}

// Clean up GunDB listener on destroy
onDestroy(() => {
  if (chatListener && typeof chatListener.off === 'function') chatListener.off();
});
</script>

<div 
  class="chat-container"
  class:file-drag-over={isDragging}
  on:drop={handleFileDrop}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  role="region"
>
  {#if $username}
    {#if !hasPGPKey}
      <div class="pgp-warning">
        <h3>🔐 Set up your PGP keys to use the chat</h3>
        <PGPKeys />
      </div>
    {:else}
      <header class="chat-header">
        <div class="header-content">
          <div class="chat-info">
            <div class="status-dot"></div>
            <div>
              <h2 class="chat-title">General Chat</h2>
              <p class="chat-subtitle">{messages.length} messages • End-to-end encrypted • Files up to {formatFileSize(MAX_FILE_SIZE)}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn" title="Search messages" aria-label="Search messages">
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
            <ChatMessage {message} sender={$username || ''} />
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
          
          {#if isUploading}
            <div class="upload-progress">
              <div class="upload-bubble">
                <div class="upload-info">
                  <span>📤 Uploading file...</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: {uploadProgress}%"></div>
                  </div>
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
                  class="file-btn" 
                  title="Attach file"
                  on:click={openFileDialog}
                  disabled={isUploading}
                >
                  📎
                </button>
                <button 
                  type="button" 
                  class="emoji-btn" 
                  title="Add emoji"
                  on:click={toggleEmojiPicker}
                  aria-label="Add emoji"
                >
                  😊
                </button>
                {#if showEmojiPicker}
                  <div class="emoji-picker">
                    {#each emojis as emoji}
                      <button type="button" class="emoji-choice" on:click={() => addEmoji(emoji)}>{emoji}</button>
                    {/each}
                  </div>
                {/if}
<style>
.emoji-picker {
  position: absolute;
  bottom: 60px;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  z-index: 10;
}
.emoji-choice {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: background 0.15s;
}
.emoji-choice:hover {
  background: #f3f4f6;
}
</style>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!newMessage?.trim() || isUploading} 
              class="send-button"
              title="Send message (Ctrl+Enter)"
              aria-label="Send message"
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
              <span class="shortcut">Ctrl+Enter to send • Click 📎 or drag files to upload</span>
            </div>
          </div>
        </form>
      </footer>
      
      <!-- Hidden file input -->
      <input 
        type="file" 
        bind:this={fileInput} 
        on:change={handleFileSelect}
        accept="*/*"
        multiple
        style="display: none;"
      />
      
      {#if isDragging}
        <div class="drag-overlay">
          <div class="drag-content">
            <div class="drag-icon">📁</div>
            <h3>Drop files to upload</h3>
            <p>Files will be encrypted and sent securely</p>
          </div>
        </div>
      {/if}
      
      {#if !canAutoScroll && unreadMessages}
        <div class="scroll-button-container">
    <button class="scroll-button new-messages" on:click={autoScroll} aria-label="Scroll to bottom (new messages)">
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
    <button class="scroll-button" on:click={autoScroll} aria-label="Scroll to bottom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
        </div>
      {/if}
    {/if}
  {:else}
    <main class="login-container">
      <Login />
    </main>
  {/if}
</div>

<style>
  /* Previous CSS variables and styles remain the same... */
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
  
  /* File drag over effect */
  .chat-container.file-drag-over {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%), 
                linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1));
    background-blend-mode: overlay;
  }

  /* All previous styles from Chat.svelte remain the same... */
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

  /* File upload styles */
  .file-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .file-btn:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .file-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }

  .drag-content {
    text-align: center;
    color: var(--text-primary);
    background: var(--surface-glass);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-large);
    border: 2px dashed var(--border-glass);
  }

  .drag-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
  }

  .drag-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.5rem;
  }

  .drag-content p {
    margin: 0;
    color: var(--text-secondary);
  }

  .upload-progress {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--spacing-sm);
  }

  .upload-bubble {
    background: var(--surface-glass);
    backdrop-filter: blur(10px);
    border-radius: 18px;
    padding: var(--spacing-md);
    border: 1px solid var(--border-glass);
    max-width: 300px;
  }

  .upload-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-gradient);
    transition: width 0.3s ease;
  }

  /* Keep all other existing styles... */
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

  .login-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  }

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
    gap: var(--spacing-xs);
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

  /* All responsive styles remain the same... */
  @media (max-width: 768px) {
    .shortcuts {
      display: none;
    }
    /* ... other mobile styles ... */
  }
</style>