// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: 8080,
      warmup: {
        clientFiles: [
          "./src/routes/__root.tsx",
          "./src/routes/index.tsx",
          "./src/components/LoginPage.tsx",
          "./src/components/AppShell.tsx",
        ],
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "lucide-react",
        "recharts",
        "date-fns",
        "clsx",
        "tailwind-merge",
        "zustand",
        "sonner",
        "zod",
        "react-hook-form",
      ],
    },
  },
});

