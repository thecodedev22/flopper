
<script>
  import { user } from './user';
  
  let username = '';
  let password = '';
  let isSignupMode = false;
  let showPassword = false;
  let isLoading = false;
  let errorMessage = '';
  
  function login() {
    isLoading = true;
    errorMessage = '';
    
    user.auth(username, password, ({ err }) => {
      isLoading = false;
      if (err) {
        errorMessage = err;
      } else {
        errorMessage = '';
        // Success handling here
      }
    });
  }
  
  function signup() {
    isLoading = true;
    errorMessage = '';
    
    user.create(username, password, ({ err }) => {
      if (err) {
        isLoading = false;
        errorMessage = err;
      } else {
        login();
      }
    });
  }
  
  function handleSubmit() {
    if (isSignupMode) {
      signup();
    } else {
      login();
    }
  }
  
  function toggleMode() {
    isSignupMode = !isSignupMode;
    errorMessage = '';
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="auth-container">
  <div class="bg-animation">
    <div class="floating-shape shape-1"></div>
    <div class="floating-shape shape-2"></div>
    <div class="floating-shape shape-3"></div>
  </div>
  
  <div class="auth-card">
    <div class="auth-header">
      <h1 class="auth-title">
        {isSignupMode ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p class="auth-subtitle">
        {isSignupMode ? 'Sign up to get started' : 'Sign in to your account'}
      </p>
    </div>

    <div class="mode-toggle">
      <div class="toggle-slider" class:signup-mode={isSignupMode}></div>
      <button 
        type="button" 
        class="toggle-option" 
        class:active={!isSignupMode}
        on:click={() => isSignupMode = false}
      >
        Sign In
      </button>
      <button 
        type="button" 
        class="toggle-option" 
        class:active={isSignupMode}
        on:click={() => isSignupMode = true}
      >
        Sign Up
      </button>
    </div>

    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <input 
          type="text" 
          id="username" 
          name="username"
          bind:value={username} 
          minlength="3" 
          maxlength="16"
          class="form-input" 
          placeholder="Enter your username"
          required
          disabled={isLoading}
        >
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-container">
          <input 
            type={showPassword ? 'text' : 'password'}
            id="password" 
            name="password"
            bind:value={password} 
            class="form-input" 
            placeholder="Enter your password"
            required
            disabled={isLoading}
          >
          <button
            type="button"
            class="toggle-password"
            on:click={togglePasswordVisibility}
            disabled={isLoading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        class="submit-btn"
        disabled={isLoading || !username || !password}
      >
        {#if isLoading}
          <span class="loading-spinner"></span>
          {isSignupMode ? 'Creating account...' : 'Signing in...'}
        {:else}
          {isSignupMode ? 'Sign Up' : 'Sign In'}
        {/if}
      </button>
    </form>

    {#if !isSignupMode}
      <div class="forgot-password">
        <button type="button" class="forgot-link">
          Forgot your password?
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 1rem;
  }

  .bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .floating-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  .shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .shape-2 {
    width: 150px;
    height: 150px;
    top: 70%;
    right: 10%;
    animation-delay: 2s;
  }

  .shape-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(120deg); }
    66% { transform: translateY(10px) rotate(240deg); }
  }

  .auth-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 2.5rem;
    width: 420px;
    max-width: 100%;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .auth-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 35px 70px rgba(0, 0, 0, 0.2);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-title {
    color: white;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .auth-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    font-weight: 400;
  }

  .mode-toggle {
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 2rem;
    position: relative;
  }

  .toggle-option {
    flex: 1;
    padding: 12px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
  }

  .toggle-option.active {
    color: #667eea;
    font-weight: 600;
  }

  .toggle-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    transition: transform 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .toggle-slider.signup-mode {
    transform: translateX(100%);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  .form-input {
    width: 100%;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .form-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .password-container {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.3s ease;
  }

  .toggle-password:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.9);
  }

  .toggle-password:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .submit-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .submit-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-message {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fecaca;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }

  .forgot-password {
    text-align: center;
    margin-top: 1.5rem;
  }

  .forgot-link {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .forgot-link:hover {
    color: white;
  }

  .success-content {
    text-align: center;
    padding: 2rem 0;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .success-title {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .success-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .success-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .dashboard-btn, .logout-btn {
    padding: 16px 24px;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dashboard-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .dashboard-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 2rem 1.5rem;
      margin: 1rem;
    }
    
    .auth-title {
      font-size: 1.75rem;
    }
  }
</style>