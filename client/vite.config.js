import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Keep the browser proxy and Express listener on the same IPv4 loopback
    // address. This avoids localhost resolving to IPv6 on some Windows setups.
    proxy: { "/api": "http://127.0.0.1:3001" }
  }
});
