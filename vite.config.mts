import path from "node:path";
import vue from "@vitejs/plugin-vue";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
    },
    plugins: [
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
        manifest: {
          name: "myNGO",
          short_name: "myNGO",
          description: "A modern Vue 3 application boilerplate",
          theme_color: "#ffffff",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          icons: [
            {
              src: "/icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^${env.VITE_API_URL || 'https://api-myngo.0o0.my'}/.*`),
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 80,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
              active: false,
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Make environment variables available at build time
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'https://api-myngo.0o0.my'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    base: "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      manifest: true,
      sourcemap: mode === 'development',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('pinia')) {
                return 'vendor';
              }
              return 'deps';
            }
            if (id.includes('components/ui')) {
              return 'ui';
            }
            if (id.includes('/admin/')) {
              return 'admin';
            }
            if (id.includes('/user/')) {
              return 'user';
            }
            if (id.includes('/superadmin/')) {
              return 'superadmin';
            }
            if (id.includes('/manager/')) {
              return 'manager';
            }
            if (id.includes('/login') || id.includes('/register') || id.includes('/forgot-password')) {
              return 'auth';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }

            if (/\.(woff|woff2|eot|ttf|otf)$/.test(name ?? '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    preview: {
      port: Number(env.FRONTEND_PORT) || 3000,
      host: env.FRONTEND_HOST || "0.0.0.0",
    },
    server: {
      host: env.FRONTEND_HOST || "0.0.0.0",
      port: Number(env.FRONTEND_PORT) || 3000,
      strictPort: false,
      open: mode === 'development',
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || `http://localhost:${env.API_PORT || 3001}`,
          changeOrigin: true,
          secure: false,
        }
      } : undefined,
      cors: true,
      hmr: {
        overlay: true
      }
    },
  };
});
