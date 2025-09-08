<script>

	import { onMount } from 'svelte';
	import { db, username, availableUsers } from './user';
	import { get } from 'svelte/store';
	import { adminList, isAdmin } from './admins.js';

	let userList = [];
	let peerCount = 0;
	let serverTime = '';
	let accessDenied = false;
	let newAdmin = '';
	let adminError = '';
	let adminSuccess = '';

	$: currentUser = $username;

	// Only allow admin
	$: accessDenied = !isAdmin(currentUser);

	
	function fetchUsers() {
		const users = [];
		db.get('~@').map().once((data, key) => {
			if (data && key) {
				users.push(key);
				userList = [...users];
			}
		});
	}

	// Get peer count (number of connected peers)
	function updatePeerCount() {
		if (db && db._ && db._.opt && db._.opt.peers) {
			peerCount = Object.keys(db._.opt.peers).length;
		}
	}

	// Get server time
	function updateServerTime() {
		serverTime = new Date().toLocaleString();
	}

	onMount(() => {
		fetchUsers();
		updatePeerCount();
		updateServerTime();
		const peerInterval = setInterval(updatePeerCount, 5000);
		const timeInterval = setInterval(updateServerTime, 1000);
		return () => {
			clearInterval(peerInterval);
			clearInterval(timeInterval);
		};
	});
</script>

{#if accessDenied}
	<div class="admin-denied">
		<h2>Access Denied</h2>
		<p>You do not have permission to view this page.</p>
	</div>
{:else}
	<div class="admin-panel">
		<h1>Admin Portal</h1>
		<section class="server-info">
			<h2>Server Information</h2>
			<ul>
				<li><strong>Connected Peers:</strong> {peerCount}</li>
				<li><strong>Server Time:</strong> {serverTime}</li>
			</ul>
		</section>
		<section class="admin-list">
			<h2>Admin Users</h2>
			<ul>
				{#each $adminList as admin}
					<li>{admin}</li>
				{/each}
			</ul>
			<form on:submit|preventDefault={() => {
				adminError = '';
				adminSuccess = '';
				if (!newAdmin.trim()) {
					adminError = 'Enter a username.';
					return;
				}
				if (get(adminList).includes(newAdmin.trim())) {
					adminError = 'User is already an admin.';
					return;
				}
				adminList.update(list => [...list, newAdmin.trim()]);
				adminSuccess = `Added admin: ${newAdmin.trim()}`;
				newAdmin = '';
			}}>
				<input type="text" placeholder="Add admin username" bind:value={newAdmin} />
				<button type="submit">Add Admin</button>
			</form>
			{#if adminError}
				<div class="error-message">{adminError}</div>
			{/if}
			{#if adminSuccess}
				<div class="success-message">{adminSuccess}</div>
			{/if}
		</section>

		<section class="user-list">
			<h2>User List</h2>
			{#if userList.length === 0}
				<p>No users found.</p>
			{:else}
				<ul>
					{#each userList as user}
						<li>{user}</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
.admin-panel {
	max-width: 600px;
	margin: 3rem auto;
	padding: 2.5rem 2rem 2rem 2rem;
	background: rgba(255,255,255,0.15);
	border-radius: 24px;
	box-shadow: 0 8px 32px rgba(0,0,0,0.12);
	color: #222;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.admin-panel h1 {
	font-size: 2.2rem;
	color: #764ba2;
	margin-bottom: 1.5rem;
}
.server-info, .user-list {
	width: 100%;
	margin-bottom: 2rem;
	background: rgba(255,255,255,0.2);
	border-radius: 16px;
	padding: 1.5rem;
	box-shadow: 0 2px 12px #0001;
}
.server-info h2, .user-list h2 {
	color: #667eea;
	margin-bottom: 1rem;
}
.server-info ul, .user-list ul {
	list-style: none;
	padding: 0;
}
.server-info li, .user-list li {
	font-size: 1.1rem;
	margin-bottom: 0.5rem;
}
.admin-denied {
	max-width: 400px;
	margin: 5rem auto;
	padding: 2rem;
	background: rgba(255,0,0,0.08);
	border-radius: 18px;
	color: #b91c1c;
	text-align: center;
	box-shadow: 0 4px 24px rgba(255,0,0,0.08);
}
.admin-denied h2 {
	font-size: 2rem;
	margin-bottom: 1rem;
}
</style>
