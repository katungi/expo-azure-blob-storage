import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  minify: true,
  exports: true,
  clean: true,
  external: [
    "expo",
    "expo-file-system",
    "expo-image-picker",
    "expo-constants",
    "react-native",
  ],
});
