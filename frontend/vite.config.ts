import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "https://ai-notion.onrender.com",
      "/notes": "https://ai-notion.onrender.com",
      "/shared": "https://ai-notion.onrender.com",
      "/insights": "https://ai-notion.onrender.com",
    },
  },
});