import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // For production: use relative path to leverage Vercel proxy (avoids CORS)
  // For development: use relative path to leverage Vite proxy
  const apiUrl = "/";
  
  // Backend URL for Vite dev server proxy
  const backendUrl =
    env.VITE_API_URL || "https://billing-app-server-det4.onrender.com/";

  return {
    plugins: [react()],
    define: {
      // Use VITE_API_URL for services, default to "/" for relative paths
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    server: {
      proxy: {
        "/api": {
          target: backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // Keep /api in the path when forwarding
        },
      },
    },
  };
});
