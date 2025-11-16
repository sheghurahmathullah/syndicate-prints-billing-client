import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    define: {
      "import.meta.env.API_URL": JSON.stringify(
        env.API_URL || "https://prod-billing-app-server.onrender.com/"
      ),
    },
  };
});
