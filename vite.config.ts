import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Authored prose: formatting would change the rendered pages.
    ignorePatterns: ["content/**"],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
