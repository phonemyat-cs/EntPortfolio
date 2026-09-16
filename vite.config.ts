import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// This was previously four lines wrapping @lovable.dev/vite-tanstack-config,
// which supplied the entire plugin chain. What follows is that chain written
// out: the same open-source plugins in the same order, minus the parts that
// only did something inside Lovable's editor sandbox (devtools injection, an
// HMR gate, a dev-server bridge, and an asset proxy pointed at *.lovable.app).
//
// Plugin order matters. tanstackStart must come before viteReact, because it
// generates the route tree that React then transforms.
export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Fail the build if client code imports a server module, rather than
      // shipping it to the browser. Carried over unchanged.
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Point Start's server entry at src/server.ts, our SSR error wrapper.
      // Nitro builds from this.
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
  resolve: {
    // Duplicate copies of React or Query in the graph break hooks and context
    // at runtime with errors that look like application bugs.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  server: {
    port: 8080,
  },
});
