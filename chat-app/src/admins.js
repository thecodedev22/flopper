import { writable, get } from 'svelte/store';

// Store a list of admin usernames
export const adminList = writable(['banana']);

// Helper to check if a username is admin
export function isAdmin(username) {
  return get(adminList).includes(username);
}
