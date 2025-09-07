<script>
import { conversations, activeConversation, username } from './user.js';

export let onSelectConversation;

function selectConversation(conv) {
    activeConversation.set(conv);
    onSelectConversation && onSelectConversation(conv);
}

function getOtherParticipant(participants, currentUser) {
    return participants.find(p => p !== currentUser);
}
</script>

<div class="conversation-list">
    <h3>Your Conversations</h3>
    {#each Object.values($conversations) as conversation}
        <div 
            class="conversation-item" 
            class:active={$activeConversation?.id === conversation.id}
            on:click={() => selectConversation(conversation)}
        >
            {#if conversation.type === 'private'}
                {@const otherUser = getOtherParticipant(conversation.participants, $username)}
                <img src={`https://avatars.dicebear.com/api/human/${otherUser}.svg`} alt="avatar" />
                <div class="conversation-info">
                    <div class="conversation-name">{otherUser}</div>
                    {#if conversation.lastMessage}
                        <div class="last-message">{conversation.lastMessage.what}</div>
                    {/if}
                </div>
            {:else}
                <div class="conversation-info">
                    <div class="conversation-name">Public Chat</div>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
.conversation-list {
    padding: 1rem;
    border-right: 1px solid #ddd;
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
}

.conversation-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 0.5rem;
}

.conversation-item:hover {
    background-color: #f0f0f0;
}

.conversation-item.active {
    background-color: #e3f2fd;
}

.conversation-item img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 0.75rem;
}

.conversation-info {
    flex: 1;
}

.conversation-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.last-message {
    font-size: 0.875rem;
    color: #666;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>