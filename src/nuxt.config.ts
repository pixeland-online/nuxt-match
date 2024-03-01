export default defineNuxtConfig({
  nitro: {
    scanDirs: ["/matches"],
    experimental: {
      websocket: true,
    },
  },
});
