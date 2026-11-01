import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

const backendProxy = Object.fromEntries(
  [
    '^/api(?=/|$)',
    '/advanced-scan',
    '/network-mapper',
    '/vuln-scanner',
    '/scan-history',
    '/router-info',
    '/cpu-monitor',
    '/network-stats',
    '/system-info',
    '/web-scan',
    '/ping-sweep',
    '/call',
    '/uploads',
    '/downloads',
  ].map((route) => [
    route,
    {
      target: 'http://127.0.0.1:3001',
      changeOrigin: true,
    },
  ]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: backendProxy,
  },
  preview: {
    proxy: backendProxy,
  },
})
