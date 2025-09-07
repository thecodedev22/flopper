import GUN from 'gun';
import 'gun/sea';
import 'gun/axe';
import {writable} from 'svelte/store';

//Database 
export const db = GUN();

//The user
export const user = db.user().recall ({sessionStorage: true});

//current users username
export const username = writable('');
user.get('alias').on(v => username.set(v));

// ADD THE NEW CODE BELOW:
// Active conversations store
export const conversations = writable({});
export const activeConversation = writable(null);

// Get all users for private messaging
export const availableUsers = writable([]);

// Function to create a conversation ID from two usernames
export function createConversationId(user1, user2) {
    return [user1, user2].sort().join('_');
}

// Function to start a private conversation
export async function startConversation(targetUsername, currentUsername) {
    const conversationId = createConversationId(targetUsername, currentUsername);
    activeConversation.set({
        id: conversationId,
        participants: [targetUsername, currentUsername],
        type: 'private'
    });
    return conversationId;
}

// Function to get online users
export function getOnlineUsers() {
    const users = new Set();
    
    // Listen for users who have been active recently (last 5 minutes)
    const fiveMinutesAgo = new Date(+new Date() - 5 * 60 * 1000).toISOString();
    
    db.get('online_users').map().on((data, key) => {
        if (data && data.timestamp > fiveMinutesAgo) {
            users.add(data.username);
        }
    });
    
    // Update the available users store periodically
    setInterval(() => {
        availableUsers.set(Array.from(users));
    }, 10000); // Update every 10 seconds
}

// Function to mark user as online
export function markUserOnline(username) {
    if (username) {
        db.get('online_users').get(username).put({
            username: username,
            timestamp: new Date().toISOString()
        });
    }
}