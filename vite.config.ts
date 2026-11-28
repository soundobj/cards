import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { appBaseUrl } from './src/appConfig'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: appBaseUrl,
})
