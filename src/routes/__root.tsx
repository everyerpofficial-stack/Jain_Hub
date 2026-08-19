import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AppDialogs } from "@/components/AppDialogs";
import { useStore } from "../lib/store";
import { LoginPage } from "@/components/LoginPage";
import { useRealtimeSync } from "@/lib/useRealtimeSync";

// After a redeploy, a browser tab that's still open may hold references to
// old hashed chunk filenames (e.g. collections-D4gWl40X.js) that no longer
// exist on the server. Vite fires "vite:preloadError" when a lazy route
// chunk 404s this way; the fix is a one-time hard reload to pick up the
// fresh HTML/asset manifest. Guarded via sessionStorage so a genuinely
// broken deploy doesn't reload-loop forever.
const CHUNK_ERROR_PATTERN =
  /fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading chunk .* failed/i;
const CHUNK_RELOAD_FLAG = "jain-finance-chunk-reload-attempted";

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_ERROR_PATTERN.test(message);
}

function reloadOnceForChunkError(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(CHUNK_RELOAD_FLAG)) return false;
  sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
  window.location.reload();
  return true;
}

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    // A stale chunk after a redeploy can't be fixed by re-running loaders —
    // the module is permanently 404ing until the page fetches the new
    // manifest, so recover automatically instead of leaving the user stuck.
    if (chunkError) {
      reloadOnceForChunkError();
    }
  }, [error, chunkError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {chunkError
            ? "A new version of the app was published. Reloading to update…"
            : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              if (chunkError) {
                window.location.reload();
                return;
              }
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Jain Mobile & Finance ERP" },
      { name: "description", content: "Jain Mobile & Finance ERP — Management platform for mobile inventory, sales, loans, EMI collections and financial reporting." },
      { name: "author", content: "Jain Mobile & Finance" },
      { property: "og:title", content: "Jain Mobile & Finance ERP" },
      { property: "og:description", content: "Management platform for mobile inventory, sales, loans, EMI collections and financial reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@JainMobile" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo.png?v=3" },
      { rel: "shortcut icon", type: "image/x-icon", href: "/favicon.ico?v=3" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=3" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const currentUser = useStore((s) => s.currentUser);
  const recheckStatuses = useStore((s) => s.recheckStatuses);

  // 🔄 Real-time bidirectional Google Sheets sync — polls every 30s
  useRealtimeSync();

  useEffect(() => {
    if (currentUser) {
      recheckStatuses();
    }
  }, [currentUser, recheckStatuses]);

  // This mount only happens after a successful render, so it's safe to
  // re-arm the one-shot chunk-reload guard for the next deploy.
  useEffect(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
    window.addEventListener("vite:preloadError", reloadOnceForChunkError);
    return () => window.removeEventListener("vite:preloadError", reloadOnceForChunkError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {currentUser ? <Outlet /> : <LoginPage />}
      <Toaster position="top-right" richColors />
      <AppDialogs />
    </QueryClientProvider>
  );
}
