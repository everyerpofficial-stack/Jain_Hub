import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
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
});
