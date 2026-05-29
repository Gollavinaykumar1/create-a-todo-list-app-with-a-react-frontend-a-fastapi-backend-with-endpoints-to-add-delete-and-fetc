import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/create-a-todo-list-app-with-a-react-frontend-a-fastapi-backend-with-endpoints-to-add-delete-and-fetc/",
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: 3000 },
});
