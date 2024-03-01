import { createResolver } from '@nuxt/kit'
import { scanMatches } from './scan'
import { join, normalize } from 'pathe'

export default defineNitroModule({
  name: 'pixeland-matches',
  async setup(nitro) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')
    const scannedMatches = await scanMatches(nitro)
    const matches: Record<string, { handler: string, description: string }> = {}

    // Scan Matches
    for (const scannedMatch of scannedMatches) {
      if (scannedMatch.name in matches) {
        if (!matches[scannedMatch.name].handler) {
          matches[scannedMatch.name].handler = scannedMatch.handler;
        }
      } else {
        matches[scannedMatch.name] = {
          handler: scannedMatch.handler,
          description: "",
        };
      }
    }


    nitro.options.alias['#internal/pixeland'] = runtimeDir

    nitro.options.virtual["#internal/pixeland/virtual/handlers"] = () => {
      return /* js */ `
  export const handlers = {
    ${Object.entries(matches)
          .map(
            ([name, match]) =>
              `"${name}": {
            meta: {
              description: ${JSON.stringify(match.description)},
            },
            resolve: ${match.handler
                ? `() => import("${normalize(match.handler)}").then(r => r.default || r)`
                : "undefined"
              },
          }`
          )
          .join(",\n")}
  };`;
    };
  }
})