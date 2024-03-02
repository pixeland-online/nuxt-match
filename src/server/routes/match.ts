import { getQuery } from "ufo";
import type { UUID } from "crypto";

function getMatchId(url: string) {
  return getQuery(url).matchId as UUID;
}

export default defineWebSocketHandler({
  open(peer) {
    eventMatchJoin(getMatchId(peer.url), peer);
  },
  close(peer, { code, reason }) {
    eventMatchLeave(getMatchId(peer.url), peer);
  },
  message(peer, message) {
    eventMatchMessage(getMatchId(peer.url), peer, message);
  },
  error(peer, error) {},
});
