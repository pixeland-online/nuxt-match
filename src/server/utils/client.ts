import type { Peer } from "crossws";
import { randomUUID, type UUID } from "crypto";
import type { Match } from "./match";

export type ClientRaw = {
  clientId: UUID;
  peerId: string;
};

export type ClientQueue = {
  key: string,
  message: string,
  tick: number
}

export class Client {
  #id = randomUUID();
  #reconnect = randomUUID();
  #match: Match
  #peer: Peer;
  #queues: Array<ClientQueue> = []

  get reconnect() {
    return this.#reconnect;
  }

  get id() {
    return this.#id;
  }

  get peerId() {
    return this.#peer.id;
  }

  constructor(match: Match, peer: Peer) {
    this.#match = match
    this.#peer = peer;
    this.#peer.send(JSON.stringify({ op: "reconnect", data: this.reconnect }));
  }

  refresh(peer: Peer) {
    this.#reconnect = randomUUID();
    this.#peer = peer
    this.#peer.send(JSON.stringify({ op: "reconnect", data: this.reconnect }));
    this.update()
  }

  /**
   * Example 1: Chat dublicate message only tick 
   * Code:Client.send('Hello World')
   * 
   * Example 2: Move player only 1 send (Reconnect client wait 5 sec to send 1 message)
   * Code: Client.send(JSON.stringify({x: 5, y: 5}), 'move', true)
   * 
   * There is no point in sending several data about the player's movement after the reconnection, 
   * but only to receive his last positions. 
   * With the exception of chat, we receive several messages if the egg has 
   * lost contact in 5 seconds and will receive everything that was missed in the chat.
   */
  send(message: string, key: string = message, ignoreTick: boolean = false) {
    const index = this.#queues.findIndex((queue) => {
      if (queue.key == key) {
        if (ignoreTick) {
          return true
        }

        return queue.tick == this.#match.tick
      }

      return false
    })

    if (index != -1) {
      this.#queues.slice(index, 1)
    }

    this.#queues.push({ tick: this.#match.tick, message, key })
  }

  update() {
    const queues = this.#queues.slice(0, this.#queues.length)

    for (let { message } of queues) {
      this.#peer.send(message)
    }
  }
}
