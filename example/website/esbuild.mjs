import esbuild from "esbuild";
import { logger } from "esbuild-plugin-collection";

const ctx = await esbuild.context({
  entryPoints: ["dist/index.js"],
  outfile: "public/bundle.js",
  bundle: true,
  sourcemap: true,
  plugins: [
    logger(),
  ],
});

await ctx.watch();

let { host, port } = await ctx.serve({
  port: 8080,
  servedir: "./public",
})

console.log(`Serve app on ${host}:${port}`);
