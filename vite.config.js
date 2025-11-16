import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Use root path - Vite proxy handles /api/* in dev, Vercel handles it in prod
  // Services use ${API_URL}api/v1.0/... which becomes /api/v1.0/...
  const apiUrl = "/";
  const backendUrl =
    env.API_URL || "https://prod-billing-app-server.onrender.com";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.API_URL": JSON.stringify(apiUrl),
    },
    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // Keep /api in the path when forwarding
        },
      },
    },
  };
});
