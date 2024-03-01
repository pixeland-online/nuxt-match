import { getQuery } from "ufo";
import type { UUID } from "crypto";

function getMathId(url: string) {
  return getQuery(url).matchId as UUID;
}

export default defineWebSocketHandler({
  upgrade(req) {
    const matchId = getMathId(req.url);
  },
  open(peer) {
    const matchId = getMathId(peer.url);
    serverMatchJoin(matchId, peer);
  },
  close(peer, { code, reason }) {
    const matchId = getMathId(peer.url);
    serverMatchLeave(matchId, peer);
  },
  message(peer, message) {
    const matchId = getMathId(peer.url);
    serverMatchMessage(matchId, peer, message);
  },
  error(peer, error) {},
});
