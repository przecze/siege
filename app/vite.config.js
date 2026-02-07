import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8000,
    allowedHosts: ["siege.janczechowski.com", "game"],
    watch: {
      usePolling: true,
    },
  },
});
