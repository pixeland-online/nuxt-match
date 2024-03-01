export default defineWebSocketHandler({
  async open(peer) {
    console.log('open')
  },
  close(peer) {

  },
  upgrade() {
    return {}
  }
})