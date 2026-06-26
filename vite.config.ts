import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @ts-ignore
import seedPlugin from './vite.seed-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seedPlugin()],
})
