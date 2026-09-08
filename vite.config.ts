// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const EXPORT_ALL_POLYFILL =
  "if(typeof globalThis.__exportAll!=='function'){globalThis.__exportAll=function(a,t){t=t||{};for(var k in a)if(Object.prototype.hasOwnProperty.call(a,k))Object.defineProperty(t,k,{get:a[k],enumerable:true,configurable:true});return t;}};";

export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          banner: EXPORT_ALL_POLYFILL,
        },
      },
    },
    esbuild: {
      banner: EXPORT_ALL_POLYFILL,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : process.env.NITRO_PRESET || undefined,
    inlineDynamicImports: true,
    banner: EXPORT_ALL_POLYFILL,
    esbuild: {
      options: {
        banner: {
          js: EXPORT_ALL_POLYFILL,
        },
      },
    },
  },
});
