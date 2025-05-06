import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Pages from 'vite-plugin-pages'
import { VitePWA } from 'vite-plugin-pwa'
// import inject from "@rollup/plugin-inject";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    Components(),
    // inject({
    //   Buffer: ["buffer", "Buffer"],
    // }),
    AutoImport({
    
      imports: ['vue', 'vue-router'],

  
      dirs: [
        'src/composables',
    
      ],


      dts: 'src/auto-imports.d.ts',

    
    }),
    Pages(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5000 * 1024 * 1024, 
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      crypto: 'crypto-browserify',
      buffer: "buffer",
    
    },
  },
  define: {
    global: "window",
  },
  build: {
    sourcemap: true,
    rollupOptions: {
         external: ['text-encoding'],
        output:{
        
            manualChunks(id) {
              
                if (id.includes('node_modules')) {
                    return id.toString().split('node_modules/')[1].split('/')[0].toString();
                }
                
            }
        }
    }
  },
  // test: {
  //   globals: true,
  //   environment: 'jsdom'
  // }
})
