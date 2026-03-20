import path from "path";
import fs from "fs/promises";
import puppeteer from "puppeteer";
import { spawn } from 'node:child_process';


export default function pdfPlugin(eleventyConfig, userOptions = {}) {
  const options = {
    fileName: "og.png",
    waitUntil: "networkidle0",
    port: 8181,
    log: true,
    preprocess: async () => undefined,
    filter: (entry) =>
      entry.outputPath &&
      entry.outputPath.endsWith(".html") &&
      !entry.url.includes("assets"),
    ...userOptions,
  };

  function log() {
    if (options.log !== true) {
      return;
    }

    console.log(...arguments);
  }

  eleventyConfig.on("eleventy.after", async ({ dir, results, runMode }) => {
    // Safety Check.
    if (runMode === 'serve') {
      // Don't run during "serve" mode otherwise that's too much load
      // Also causes a recurision condition where it causes itself to rerender :)
      console.debug("og:screenshot is disabled in 'serve' mode");

      return;
    }

    // Start Eleventy dev server
    const eleventyPath = path.resolve('./node_modules/.bin/eleventy');
    const dev = spawn(process.platform === 'win32' ? `${eleventyPath}.cmd` : eleventyPath, [
      '--ignore-initial',
      '--serve',
      '--port=' + options.port
    ], {
      stdio: 'inherit'
    });

    // Wait for server to be ready.
    // It's crude but good enough for today,
    // and we also get time whilst browser spins up.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Start the browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      // Open a page.
      const page = await browser.newPage();

      // Loop through each page.
      for (const result of results) {
        if (!options.filter(result)) continue;
        log('Creating "pdf" for: ' + result.url);

        const pageUrl = new URL(result.url, 'http://localhost:' + options.port).toString();
        await page.goto(pageUrl, { waitUntil: options.waitUntil });

        await options.preprocess(page);
        const outDir = path.join(dir.output, result.url);
        await fs.mkdir(outDir, { recursive: true });

        const outPath = path.join(outDir, options.imageName);
        await page.pdf({
          path: outPath,
          displayHeaderFooter: false,
          format: 'A4',
          printBackground: true,
          tagged: true,
          outline: true,
          margin: {
            top: '1cm',
            bottom: '1cm',
            left: '0.5cm',
            right: '0.5cm',
          }
        });
      }
    } finally {
      await browser.close();

      dev.kill();
    }
  });
}
