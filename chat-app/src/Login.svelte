<script>
  import { user } from './user';
  
  let username = '';
  let password = '';
  let confirmPassword = '';
  let passkey = '';
  let newPassword = '';
  let confirmNewPassword = '';
  let isSignupMode = false;
  let isPasswordResetMode = false;
  let showPassword = false;
  let showConfirmPassword = false;
  let showNewPassword = false;
  let showConfirmNewPassword = false;
  let showPasskey = false;
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  let generatedPasskey = '';
  let showPasskeyModal = false;
  
  // Generate a secure passkey
  function generatePasskey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  function login() {
    isLoading = true;
    errorMessage = '';
    
    user.auth(username, password, ({ err }) => {
      isLoading = false;
      if (err) {
        errorMessage = err;
      } else {
        errorMessage = '';
        successMessage = 'Login successful! Please refresh the page.';
      }
    });
  }
  
  function signup() {
    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }
    
    if (password.length < 6) {
      errorMessage = 'Password must be at least 6 characters';
      return;
    }
    
    isLoading = true;
    errorMessage = '';
    
    // Generate passkey for the new account
    const accountPasskey = generatePasskey();
    
    user.create(username, password, ({ err }) => {
      if (err) {
        isLoading = false;
        errorMessage = err;
      } else {
        // Store the passkey in the user's profile
        user.get('profile').put({
          passkey: accountPasskey,
          created: new Date().toISOString()
        });
        
        generatedPasskey = accountPasskey;
        showPasskeyModal = true;
        isLoading = false;
      }
    });
  }
  
  function resetPassword() {
    if (!passkey.trim()) {
      errorMessage = 'Please enter your passkey';
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      errorMessage = 'New passwords do not match';
      return;
    }
    
    if (newPassword.length < 6) {
      errorMessage = 'New password must be at least 6 characters';
      return;
    }
    
    isLoading = true;
    errorMessage = '';
    
    // First, try to authenticate with current credentials to verify user exists
    user.auth(username, 'dummy', ({ err }) => {
      // We expect this to fail, but it helps us check if user exists
      
      // Check if the passkey matches
      user.get('profile').once((profile) => {
        if (profile && profile.passkey === passkey.trim()) {
          // Passkey is correct, proceed with password change
          // Note: GUN doesn't have a built-in password change method
          // This is a workaround - in production, you'd need a proper implementation
          errorMessage = 'Password reset functionality requires server-side implementation for security.';
          successMessage = 'Passkey verified! Contact support to complete password reset.';
          isLoading = false;
        } else {
          errorMessage = 'Invalid passkey or username';
          isLoading = false;
        }
      });
    });
  }
  
  function handleSubmit() {
    errorMessage = '';
    successMessage = '';
    
    if (isPasswordResetMode) {
      resetPassword();
    } else if (isSignupMode) {
      signup();
    } else {
      login();
    }
  }
  
  function toggleMode() {
    isSignupMode = !isSignupMode;
    isPasswordResetMode = false;
    clearForm();
  }
  
  function togglePasswordReset() {
    isPasswordResetMode = !isPasswordResetMode;
    isSignupMode = false;
    clearForm();
  }
  
  function clearForm() {
    username = '';
    password = '';
    confirmPassword = '';
    passkey = '';
    newPassword = '';
    confirmNewPassword = '';
    errorMessage = '';
    successMessage = '';
  }
  
  function togglePasswordVisibility(field) {
    switch(field) {
      case 'password':
        showPassword = !showPassword;
        break;
      case 'confirmPassword':
        showConfirmPassword = !showConfirmPassword;
        break;
      case 'newPassword':
        showNewPassword = !showNewPassword;
        break;
      case 'confirmNewPassword':
        showConfirmNewPassword = !showConfirmNewPassword;
        break;
      case 'passkey':
        showPasskey = !showPasskey;
        break;
    }
  }
  
  function copyPasskey() {
    navigator.clipboard.writeText(generatedPasskey).then(() => {
      // Could add a toast notification here
    });
  }
  
  function closePasskeyModal() {
    showPasskeyModal = false;
    // Auto-login after account creation
    login();
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
        {isPasswordResetMode ? 'Reset Password' : isSignupMode ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p class="auth-subtitle">
        {isPasswordResetMode ? 'Enter your passkey to reset your password' : isSignupMode ? 'Sign up to get started' : 'Sign in to your account'}
      </p>
      {#if !isPasswordResetMode}
        <div class="login-refresh-note" style="margin-top: 1em; color: #fbbf24; background: rgba(255,255,255,0.15); padding: 0.5em 1em; border-radius: 8px; font-size: 0.95em;">
          <strong>Note:</strong> After logging in, please refresh the page.
        </div>
      {/if}
    </div>

    {#if !isPasswordResetMode}
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
    {/if}

    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div class="success-message">
        {successMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      {#if !isPasswordResetMode}
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
              on:click={() => togglePasswordVisibility('password')}
              disabled={isLoading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {#if isSignupMode}
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="password-container">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword" 
                name="confirmPassword"
                bind:value={confirmPassword} 
                class="form-input" 
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              >
              <button
                type="button"
                class="toggle-password"
                on:click={() => togglePasswordVisibility('confirmPassword')}
                disabled={isLoading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        {/if}
      {:else}
        <!-- Password Reset Mode -->
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username"
            bind:value={username} 
            class="form-input" 
            placeholder="Enter your username"
            required
            disabled={isLoading}
          >
        </div>

        <div class="form-group">
          <label for="passkey" class="form-label">Recovery Passkey</label>
          <div class="password-container">
            <input 
              type={showPasskey ? 'text' : 'password'}
              id="passkey" 
              name="passkey"
              bind:value={passkey} 
              class="form-input passkey-input" 
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
              disabled={isLoading}
            >
            <button
              type="button"
              class="toggle-password"
              on:click={() => togglePasswordVisibility('passkey')}
              disabled={isLoading}
            >
              {showPasskey ? '🙈' : '👁️'}
            </button>
          </div>
          <div class="field-help">
            Enter the 16-character passkey you received when creating your account
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword" class="form-label">New Password</label>
          <div class="password-container">
            <input 
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword" 
              name="newPassword"
              bind:value={newPassword} 
              class="form-input" 
              placeholder="Enter new password"
              required
              disabled={isLoading}
            >
            <button
              type="button"
              class="toggle-password"
              on:click={() => togglePasswordVisibility('newPassword')}
              disabled={isLoading}
            >
              {showNewPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
          <div class="password-container">
            <input 
              type={showConfirmNewPassword ? 'text' : 'password'}
              id="confirmNewPassword" 
              name="confirmNewPassword"
              bind:value={confirmNewPassword} 
              class="form-input" 
              placeholder="Confirm new password"
              required
              disabled={isLoading}
            >
            <button
              type="button"
              class="toggle-password"
              on:click={() => togglePasswordVisibility('confirmNewPassword')}
              disabled={isLoading}
            >
              {showConfirmNewPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
      {/if}

      <button 
        type="submit" 
        class="submit-btn"
        disabled={isLoading || !username || (!isPasswordResetMode && !password) || (isPasswordResetMode && (!passkey || !newPassword || !confirmNewPassword)) || (isSignupMode && !confirmPassword)}
      >
        {#if isLoading}
          <span class="loading-spinner"></span>
          {isPasswordResetMode ? 'Resetting password...' : isSignupMode ? 'Creating account...' : 'Signing in...'}
        {:else}
          {isPasswordResetMode ? 'Reset Password' : isSignupMode ? 'Sign Up' : 'Sign In'}
        {/if}
      </button>
    </form>

    <div class="auth-links">
      {#if isPasswordResetMode}
        <button type="button" class="auth-link" on:click={toggleMode}>
          Back to Sign In
        </button>
      {:else}
        <button type="button" class="auth-link" on:click={togglePasswordReset}>
          Forgot your password?
        </button>
      {/if}
    </div>
  </div>
</div>

<!-- Passkey Modal -->
{#if showPasskeyModal}
  <div class="modal-overlay">
    <div class="passkey-modal">
      <div class="modal-header">
        <h2 class="modal-title">🔑 Your Recovery Passkey</h2>
        <p class="modal-subtitle">Save this passkey securely - you'll need it to reset your password</p>
      </div>
      
      <div class="passkey-display">
        <div class="passkey-value">{generatedPasskey}</div>
        <button type="button" class="copy-btn" on:click={copyPasskey} title="Copy to clipboard">
          📋 Copy
        </button>
      </div>
      
      <div class="modal-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Important:</strong> Store this passkey in a safe place. It's the only way to recover your account if you forget your password.
        </div>
      </div>
      
      <button type="button" class="modal-btn" on:click={closePasskeyModal}>
        I've saved my passkey
      </button>
    </div>
  </div>
{/if}

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
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
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
    z-index: 2;
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

  .form-input.passkey-input {
    font-family: 'Courier New', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
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

  .field-help {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.5rem;
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

  .success-message {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #bbf7d0;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }

  .auth-links {
    text-align: center;
    margin-top: 1.5rem;
  }

  .auth-link {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.3s ease;
    text-decoration: underline;
  }

  .auth-link:hover {
    color: white;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
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

  .passkey-modal {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 2.5rem;
    width: 450px;
    max-width: 90vw;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .modal-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .modal-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    margin: 0;
  }

  .passkey-display {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .passkey-value {
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 600;
    color: #22d3ee;
    letter-spacing: 0.1em;
    flex: 1;
    text-align: center;
  }

  .copy-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .modal-warning {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .warning-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .warning-text {
    color: #fcd34d;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .modal-btn {
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
  }

  .modal-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    .auth-card, .passkey-modal {
      padding: 2rem 1.5rem;
      margin: 1rem;
    }
    
    .auth-title, .modal-title {
      font-size: 1.75rem;
    }

    .passkey-display {
      flex-direction: column;
      text-align: center;
    }

    .passkey-value {
      font-size: 1rem;
    }
  }
</style>