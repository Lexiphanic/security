import { encryptHTML } from 'pagecrypt/core';
import fs from 'fs';
import matter from 'gray-matter';
import settings from './settings.json' with {type: "json"};

// START 11TY imports
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
// import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
// END 11TY imports

// START LibDoc imports
import libdocConfig from "./_data/libdocConfig.js";
import libdocFunctions from "./_data/libdocFunctions.js";
// END LibDoc imports

import ogScreenshotPlugin from "./eleventy-og-screenshot.js";

export default function (eleventyConfig) {
    // We can't use .gitignore as we import `disclosures` at build (or dev) time.
    eleventyConfig.setUseGitIgnore(false);
    eleventyConfig.ignores.add('node_modules');
    eleventyConfig.ignores.add('.vscode');
    eleventyConfig.ignores.add('_site');
    eleventyConfig.ignores.add('.cache');

    // START PLUGINS
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    // eleventyConfig.addPlugin(eleventyImageTransformPlugin, libdocFunctions.pluginsParameters.eleventyImageTransform());
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(ogScreenshotPlugin, {
        selector: (entry) => entry.url.startsWith('/tags/') ? "main" : "main > header",
        imageName: "og.png",
        viewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
        filter: (entry) => entry.outputPath?.endsWith('.html'),
        preprocess: (element, page) => {
            page.evaluate(() => {
                document.getElementById('sidebar').style.display = 'none'
            })
        }
    });

    // Optional: expose ogImageUrl in computed data
    eleventyConfig.addGlobalData("eleventyComputed", {
        ogImageUrl: (data) => {
            if (!data.page || !data.page.url) return null;
            return new URL(
                `${data.page.url.replace(/index\.html$/, "").replace(/\/$/, "")}/og.png`,
                settings.productionUrl,
            ).toString();
        },
    });

    // END PLUGINS

    // START FILTERS
    eleventyConfig.addAsyncFilter("autoids", libdocFunctions.filters.autoids);
    eleventyConfig.addAsyncFilter("embed", libdocFunctions.filters.embed);
    eleventyConfig.addAsyncFilter("cleanup", libdocFunctions.filters.cleanup);
    eleventyConfig.addAsyncFilter("dateString", libdocFunctions.filters.dateString);
    eleventyConfig.addAsyncFilter("datePrefixText", libdocFunctions.filters.datePrefixText);
    eleventyConfig.addAsyncFilter("toc", libdocFunctions.filters.toc);
    eleventyConfig.addAsyncFilter("sanitizeJSON", libdocFunctions.filters.sanitizeJson);
    eleventyConfig.addAsyncFilter("gitLastModifiedDate", libdocFunctions.filters.gitLastModifiedDate);
    // END FILTERS

    // START COLLECTIONS
    eleventyConfig.addCollection("myTags", libdocFunctions.collections.myTags);
    eleventyConfig.addCollection("postsByDateDescending", libdocFunctions.collections.postsByDateDescending);
    // END COLLECTIONS

    // START SHORTCODES
    eleventyConfig.addShortcode("alert", libdocFunctions.shortcodes.alert);
    eleventyConfig.addPairedShortcode("alertAlt", libdocFunctions.shortcodes.alert);
    eleventyConfig.addShortcode("embed", libdocFunctions.shortcodes.embed);
    eleventyConfig.addShortcode("icons", libdocFunctions.shortcodes.icons);
    eleventyConfig.addShortcode("icon", libdocFunctions.shortcodes.icon);
    eleventyConfig.addShortcode("iconCard", libdocFunctions.shortcodes.iconCard);
    eleventyConfig.addPairedShortcode("sandbox", libdocFunctions.shortcodes.sandbox);
    eleventyConfig.addPairedShortcode("sandboxFile", libdocFunctions.shortcodes.sandboxFile);
    // END SHORTCODES

    // START FILE COPY
    eleventyConfig.addPassthroughCopy("sandboxes");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("core/assets");
    eleventyConfig.addPassthroughCopy("favicon.png");
    // END FILE COPY

    eleventyConfig.addTransform("secure", async function (content) {
        const frontMatter = matter(fs.readFileSync(this.page.inputPath).toString('utf8'));
        if (!("password" in frontMatter.data)) {
            // No passwording required.
            return content;
        }

        // Make sure the password is set and `eleventyExcludeFromCollections` is true (otherwise we leak data via search).
        if (typeof frontMatter.data.password !== 'string'
            || frontMatter.data.eleventyExcludeFromCollections !== true
        ) {
            throw new Error(
                'When using `password`, `password` must be a string and `eleventyExcludeFromCollections` must be `true`',
            );
        }
        return await encryptHTML(content, frontMatter.data.password);
    });

    return {
        pathPrefix: libdocConfig.htmlBasePathPrefix
    }
};