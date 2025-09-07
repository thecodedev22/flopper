<script>
import { availableUsers, username, startConversation } from './user.js';

export let onSelectUser;

function selectUser(targetUser) {
    if (targetUser !== $username) {
        startConversation(targetUser, $username);
        onSelectUser && onSelectUser(targetUser);
    }
}
</script>

<div class="user-list">
    <h3>Start Private Chat</h3>
    {#if $availableUsers.length === 0}
        <p>No other users online</p>
    {:else}
        {#each $availableUsers as user}
            {#if user !== $username}
                <div class="user-item" on:click={() => selectUser(user)}>
                    <img src={`https://avatars.dicebear.com/api/human/${user}.svg`} alt="avatar" />
                    <span>{user}</span>
                    <div class="online-indicator"></div>
                </div>
            {/if}
        {/each}
    {/if}
</div>

<style>
.user-list {
    padding: 1rem;
    border-right: 1px solid #ddd;
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    position: relative;
}

.user-item:hover {
    background-color: #f0f0f0;
}

.user-item img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 0.5rem;
}

.online-indicator {
    width: 8px;
    height: 8px;
    background-color: #4CAF50;
    border-radius: 50%;
    margin-left: auto;
}
</style>