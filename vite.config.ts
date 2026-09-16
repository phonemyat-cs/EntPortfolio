import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// This plugin chain was previously supplied wholesale by a vendor wrapper
// package; see docs/INVENTORY.md §4 for what it contained and why it was
// unpacked. Everything here is a stock plugin doing an ordinary job.
//
// Plugin order matters. tanstackStart must come before viteReact, because it
// generates the route tree that React then transforms.
export default defineConfig({
  plugins: [
    tailwindcss(),
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
    // Vite 8 reads the paths entry in tsconfig.json natively, which is what
    // the vite-tsconfig-paths plugin used to do here.
    tsconfigPaths: true,
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
