export default defineWebSocketHandler({
  async open(peer) {
    console.log("open");
  },
  close(peer, { code, reason }) {
    console.log("close", code, reason);
  },
  upgrade(req) {
    console.log("upgrade", req.url);
  },
  message() { },
  error(peer, error) {
    console.log("error", error);
  },
});
