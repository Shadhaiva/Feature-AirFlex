// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // 👈 or use '/customization-main/' if hosted in a subpath
  plugins: [react()],
   assetsInclude: ['**/*.glb']
})
