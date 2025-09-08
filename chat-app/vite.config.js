cat > vite.config.js <<'EOF'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    allowedHosts: [
      // Allow all ngrok subdomains
      /^([a-z0-9-]+\.)?ngrok(-free)?\.app$/
    ]
  }
})
EOF
