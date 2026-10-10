import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Authored prose: formatting would change the rendered pages.
    ignorePatterns: ["content/**"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
});
