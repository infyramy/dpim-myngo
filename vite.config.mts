import path from "node:path";
import vue from "@vitejs/plugin-vue";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
// import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const isDev = mode === 'development';
  const devPort = Number(process.env.DEV_PORT) || 5173;
  const previewPort = Number(process.env.PORT) || 3000;

  return {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
    },
    plugins: [
      vue(),
      // Disabled PWA for now to avoid build issues
      // VitePWA({...}),
      // Disabled viteImagemin for now to avoid build issues
      // !isDev && viteImagemin({...}),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      manifest: true,
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
            if (id.includes('/operator/')) {
              return 'operator';
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
      port: previewPort,
      host: "0.0.0.0",
      strictPort: false,
    },
    server: {
      host: "0.0.0.0",
      port: devPort,
      strictPort: false,
      open: isDev,
      cors: true,
      hmr: {
        overlay: true
      }
    },
  };
});
