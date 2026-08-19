import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ErrorComponent, NotFoundComponent } from "./routes/__root";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Without these, only the ROOT route had a fallback: a render error inside
    // any page (/customers, /mobiles/sales, …) fell through to TanStack's bare
    // built-in error screen instead of our recoverable one — which also carries
    // the stale-chunk auto-reload. Every route now gets the same treatment.
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
  });

  return router;
};
