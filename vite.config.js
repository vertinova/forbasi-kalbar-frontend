import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Generate a single version value used by BOTH version.json and __APP_VERSION__
const BUILD_VERSION = Date.now().toString()

const versionPlugin = () => ({
  name: 'version-plugin',
  buildStart() {
    const versionFile = path.resolve('public', 'version.json')
    fs.writeFileSync(versionFile, JSON.stringify({ version: BUILD_VERSION, buildTime: new Date().toISOString() }))
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), versionPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'vendor-leaflet';
          if (id.includes('node_modules/axios') || id.includes('node_modules/react-hot-toast') || id.includes('node_modules/react-icons')) return 'vendor-utils';
          if (id.includes('node_modules/xlsx')) return 'vendor-xlsx';
          if (id.includes('node_modules/qrcode') || id.includes('node_modules/html5-qrcode')) return 'vendor-qr';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000'
    }
  }
})
