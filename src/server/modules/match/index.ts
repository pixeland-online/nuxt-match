import { createResolver } from "@nuxt/kit";
import { scanMatches } from "./scan";
import { normalize } from "pathe";

export default defineNitroModule({
  name: "pixeland-console",
  async setup(nitro) {
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime");
    const scannedMatches = await scanMatches(nitro);
    const matches: Record<string, string> = {};

    // Scan Matches
    for (const scannedMatch of scannedMatches) {
      matches[scannedMatch.name] = scannedMatch.handler;
    }

    nitro.options.alias["#internal/pixeland"] = runtimeDir;

    nitro.options.virtual["#internal/pixeland/virtual/handlers"] = () => {
      return /* js */ `
  export const handlers = {
    ${Object.entries(matches)
      .map(
        ([name, handler]) =>
          `"${name}": {
            resolve: ${
              handler
                ? `() => import("${normalize(
                    handler
                  )}").then(r => r.default || r)`
                : "undefined"
            },
          }`
      )
      .join(",\n")}
  };`;
    };
  },
});
