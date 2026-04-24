import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "source/snooks.ts",
  outDir: "build",
  format: "cjs",
  dts: true,
  clean: true,
  sourceMap: true,
});
