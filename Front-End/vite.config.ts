import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "http://localhost:5000",
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
      'jspdf-autotable': 'jspdf-autotable/dist/jspdf.plugin.autotable'
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

