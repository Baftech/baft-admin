import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api/admin": {
          target: "https://baft-backend-dev.onrender.com",
          changeOrigin: true,
          secure: false,
        rewrite: (path) => path
        }
      }
    }
  };
});



