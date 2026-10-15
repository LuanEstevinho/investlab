import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Shell (host) carrega os remotes em runtime via Module Federation.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      federation({
        name: "mfe_shell",
        remotes: {
          mfe_ativos: env.VITE_MFE_ATIVOS_URL ?? "http://localhost:5001/assets/remoteEntry.js",
          mfe_carteira: env.VITE_MFE_CARTEIRA_URL ?? "http://localhost:5002/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom"],
      }),
    ],
    build: { target: "esnext", minify: false, cssCodeSplit: false },
  };
});
