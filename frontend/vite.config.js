import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
<<<<<<< HEAD
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
=======
  plugins: [react(), tailwindcss()],
})
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
