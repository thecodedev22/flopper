<script>
  import { generateKey } from './pgp.js';
  import { onMount } from 'svelte';

  let name = '';
  let email = '';
  let passphrase = '';
  let publicKey = '';
  let privateKey = '';
  let showKeys = false;
  let importPrivate = '';
  let importPublic = '';

  // Load keys from localStorage on mount
  onMount(() => {
    publicKey = localStorage.getItem('pgp_publicKey') || '';
    privateKey = localStorage.getItem('pgp_privateKey') || '';
  });

  async function handleGenerate() {
    if (!name || !email || !passphrase) {
      alert('Please fill all fields');
      return;
    }
    const keys = await generateKey(name, email, passphrase);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    localStorage.setItem('pgp_publicKey', publicKey);
    localStorage.setItem('pgp_privateKey', privateKey);
    alert('PGP keys generated and saved locally!');
    showKeys = true;
  }

  function handleExport() {
    showKeys = true;
  }

  function handleImport() {
    if (importPrivate && importPublic) {
      privateKey = importPrivate;
      publicKey = importPublic;
      localStorage.setItem('pgp_publicKey', publicKey);
      localStorage.setItem('pgp_privateKey', privateKey);
      alert('Keys imported and saved locally!');
      showKeys = true;
    } else {
      alert('Paste both public and private keys');
    }
  }
</script>

<div class="pgp-keys">
  <h3>PGP Key Management</h3>
  <div>
    <label>Name: <input bind:value={name} /></label>
    <label>Email: <input bind:value={email} /></label>
    <label>Passphrase: <input type="password" bind:value={passphrase} /></label>
    <button on:click={handleGenerate}>Generate Keys</button>
  </div>
  <div style="margin-top:1em;">
    <button on:click={handleExport}>Show My Keys</button>
  </div>
  <div style="margin-top:1em;">
    <h4>Import Keys</h4>
    <textarea rows="4" placeholder="Paste private key" bind:value={importPrivate}></textarea>
    <textarea rows="4" placeholder="Paste public key" bind:value={importPublic}></textarea>
    <button on:click={handleImport}>Import Keys</button>
  </div>
  {#if showKeys}
    <div style="margin-top:1em;">
      <h4>Your Public Key</h4>
      <textarea readonly rows="6">{publicKey}</textarea>
      <h4>Your Private Key</h4>
      <textarea readonly rows="6">{privateKey}</textarea>
    </div>
  {/if}
</div>

<style>
.pgp-keys {
  background: #fff;
  border-radius: 12px;
  padding: 1em;
  max-width: 500px;
  margin: 2em auto;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.pgp-keys label {
  display: block;
  margin-bottom: 0.5em;
}
.pgp-keys input, .pgp-keys textarea {
  width: 100%;
  margin-top: 0.2em;
  margin-bottom: 0.5em;
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-family: monospace;
}
.pgp-keys button {
  margin-top: 0.5em;
  padding: 0.5em 1.2em;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>