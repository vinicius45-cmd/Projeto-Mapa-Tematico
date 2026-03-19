import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      // Simplificando os aliases usando o path.resolve
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desativar em produção para builds menores
    rollupOptions: {
      output: {
        // Isso garante que os nomes dos arquivos ajudem no cache (Hash)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        
        manualChunks(id) {
          // Estratégia automática para separar node_modules
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'vendor-maps'; // Chunk isolado para mapas
            }
            return 'vendor'; // Outras bibliotecas (React, etc)
          }
        },
      },
    },
    // Limite para converter assets pequenos em base64 (economiza requests)
    assetsInlineLimit: 4096, 
  },
})