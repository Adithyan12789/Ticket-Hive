import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './', 
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "https://api.tickethive.fun",
        changeOrigin: true,
      },
      '/socket.io': {
        target: "https://api.tickethive.fun",
        ws: true,
        changeOrigin: true,
      },
    },
  },  
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['slick-carousel', 'react-datepicker', 'jspdf', 'jspdf-autotable'],
  },
  resolve: {
    alias: {
      'jspdf-autotable': 'jspdf-autotable'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "slick-carousel/slick/slick.css";
          @import "react-datepicker/dist/react-datepicker.css";
        `,
      },
    },
  },
})

