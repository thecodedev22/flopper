<script>
  import { username, user } from './user';

  function signout() {
    user.leave();
    username.set('');
  }
</script>

<header class="flopper-header">
  <div class="header-content">
    <div class="brand">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="url(#gradient)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          <path d="M12 10c0-2.2 1.8-4 4-4s4 1.8 4 4v6c0 2.2-1.8 4-4 4s-4-1.8-4-4v-6z" fill="white" fill-opacity="0.9"/>
          <circle cx="14" cy="14" r="1.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="18" cy="14" r="1.5" fill="rgba(0,0,0,0.3)"/>
          <path d="M14 18c0.5 0.5 1.2 1 2 1s1.5-0.5 2-1" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="app-name">Flopper</h1>
    </div>

    {#if $username}
      <div class="user-section">
        <div class="user-info">
          <div class="user-avatar">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${$username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} 
              alt={`${$username}'s avatar`} 
            />
            <div class="status-indicator"></div>
          </div>
          <div class="user-details">
            <span class="greeting">Welcome back</span>
            <span class="username">{$username}</span>
          </div>
        </div>

        <button class="signout-button" on:click={signout} aria-label="Sign out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>
</header>

<style>
  .flopper-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }

  .app-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin: 0;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .user-info:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .user-avatar {
    position: relative;
    width: 40px;
    height: 40px;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.3s ease;
  }

  .user-avatar:hover img {
    transform: scale(1.05);
  }

  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #4ade80;
    border: 2px solid white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
    100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .greeting {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .username {
    font-size: 0.9rem;
    color: white;
    font-weight: 600;
  }

  .signout-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .signout-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .signout-button:active {
    transform: translateY(0);
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .flopper-header {
      padding: 0.75rem 1rem;
    }

    .app-name {
      font-size: 1.5rem;
    }

    .user-info {
      padding: 0.375rem 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
    }

    .greeting {
      display: none;
    }

    .signout-button {
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 480px) {
    .header-content {
      gap: 0.5rem;
    }

    .brand {
      gap: 0.5rem;
    }

    .user-section {
      gap: 0.5rem;
    }
  }
</style>