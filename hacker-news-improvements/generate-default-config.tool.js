import { join } from "path";
import { writeFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { hackerNewsImprovementsConfig } from "./src/hn-config.js";
import { getDefaultsFromConfig } from "./src/config/helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

writeFileSync(join(__dirname, "src", "default-config.generated.ts"), `
/* This file is generated for code completion purposes */
 const temp = ${JSON.stringify(getDefaultsFromConfig(hackerNewsImprovementsConfig))};
 export type HackerNewsSavedConfig = typeof temp;`);
