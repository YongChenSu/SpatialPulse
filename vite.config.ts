import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'node_modules/cesium/Build/Cesium/Workers', dest: 'cesium', rename: { stripBase: 4 } },
        { src: 'node_modules/cesium/Build/Cesium/ThirdParty', dest: 'cesium', rename: { stripBase: 4 } },
        { src: 'node_modules/cesium/Build/Cesium/Assets', dest: 'cesium', rename: { stripBase: 4 } },
        { src: 'node_modules/cesium/Build/Cesium/Widgets', dest: 'cesium', rename: { stripBase: 4 } },
      ],
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
      '/ws': { target: 'ws://localhost:8787', ws: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})
