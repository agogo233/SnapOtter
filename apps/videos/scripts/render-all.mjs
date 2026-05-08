import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import fs from "node:fs";
import path from "node:path";

const COMPOSITIONS = [
  { id: "XLaunchVideo", slug: "x-launch" },
  { id: "ProductDemo", slug: "product-demo" },
  { id: "PromoTeaser", slug: "promo-teaser-square" },
  { id: "PromoTeaserVertical", slug: "promo-teaser-vertical" },
];

const OUTPUT_DIR = path.resolve("./out");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log("Bundling...");
const bundleLocation = await bundle({
  entryPoint: "./src/index.ts",
  webpackOverride: (config) => enableTailwind(config),
});
console.log("Bundle complete.\n");

for (const comp of COMPOSITIONS) {
  console.log(`Rendering ${comp.id}...`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: comp.id,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    crf: 20,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    concurrency: 4,
    outputLocation: path.join(OUTPUT_DIR, `${comp.slug}.mp4`),
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) process.stdout.write(`\r  ${pct}%`);
    },
  });

  console.log(`\r  Done: ${comp.slug}.mp4`);
}

console.log(`\nAll ${COMPOSITIONS.length} videos rendered to ${OUTPUT_DIR}`);
