import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import TanStackRouterVite from '@tanstack/router-plugin/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function buildRacesIndex(): string[] {
  try {
    const racesDir = path.resolve(__dirname, 'public', 'races')
    const files = fs.existsSync(racesDir) ? fs.readdirSync(racesDir) : []
    return files
      .filter((f) => f.toLowerCase().endsWith('.csv'))
      .map((f) => f.replace(/\.csv$/i, ''))
  } catch {
    return []
  }
}

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  base: '/utiming/',
  define: {
    __RACES_INDEX__: JSON.stringify(buildRacesIndex()),
  },
})
