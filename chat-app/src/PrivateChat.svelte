<script>
import Chat from './Chat.svelte';
import UserList from './UserList.svelte';
import ConversationList from './ConversationList.svelte';
import { activeConversation, username, getOnlineUsers } from './user.js';
import { onMount } from 'svelte';

let showUserList = false;

function toggleUserList() {
    showUserList = !showUserList;
}

function selectPublicChat() {
    activeConversation.set({
        id: 'public',
        participants: [],
        type: 'public'
    });
}

// Set default to public chat and start getting online users
onMount(() => {
    if (!$activeConversation) {
        selectPublicChat();
    }
    getOnlineUsers();
});

function getOtherParticipant(participants, currentUser) {
    return participants.find(p => p !== currentUser);
}
</script>

<div class="private-chat-container">
    <div class="sidebar">
        <div class="chat-controls">
            <button 
                class="public-chat-btn" 
                class:active={$activeConversation?.type === 'public'}
                on:click={selectPublicChat}
            >
                🌍 Public Chat
            </button>
            <button class="new-chat-btn" on:click={toggleUserList}>
                ➕ New Private Chat
            </button>
        </div>
        
        {#if showUserList}
            <UserList onSelectUser={() => showUserList = false} />
        {:else}
            <ConversationList />
        {/if}
    </div>
    
    <div class="chat-area">
        {#if $activeConversation}
            <div class="chat-header">
                {#if $activeConversation.type === 'private'}
                    {@const otherUser = getOtherParticipant($activeConversation.participants, $username)}
                    <img src={`https://avatars.dicebear.com/api/human/${otherUser}.svg`} alt="avatar" />
                    <span>Private chat with {otherUser}</span>
                    <div class="encryption-indicator">🔒</div>
                {:else}
                    <span>🌍 Public Chat Room</span>
                {/if}
            </div>
            <Chat />
        {:else}
            <div class="no-chat">
                <p>Select a conversation or start a new private chat</p>
            </div>
        {/if}
    </div>
</div>

<style>
.private-chat-container {
    display: flex;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #fff;
}

.sidebar {
    width: 300px;
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
}

.chat-controls {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
}

.public-chat-btn, .new-chat-btn {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
}

.public-chat-btn {
    background-color: #28a745;
    color: white;
}

.public-chat-btn.active {
    background-color: #218838;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.new-chat-btn {
    background-color: #007bff;
    color: white;
}

.public-chat-btn:hover, .new-chat-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.chat-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.chat-header img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.chat-header span {
    font-weight: 500;
    color: #333;
}

.encryption-indicator {
    margin-left: auto;
    color: #28a745;
    font-size: 1.1em;
    title: "End-to-end encrypted";
}

.no-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-size: 1.1rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .private-chat-container {
        flex-direction: column;
        height: 100vh;
    }
    
    .sidebar {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid #dee2e6;
    }
    
    .chat-controls {
        display: flex;
        gap: 0.5rem;
    }
    
    .public-chat-btn, .new-chat-btn {
        margin-bottom: 0;
    }
}
</style>