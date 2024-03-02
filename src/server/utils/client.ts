import type { Peer } from "crossws";
import { randomUUID, type UUID } from "crypto";

export type ClientRaw = {
  clientId: UUID;
  peerId: string;
};

export class Client {
  #id = randomUUID();
  #reconnect = randomUUID();
  #peer: Peer;

  get reconnect() {
    return this.#reconnect;
  }

  get id() {
    return this.#id;
  }

  get peerId() {
    return this.#peer.id;
  }

  set peer(peer: Peer) {
    this.#peer = peer;
    this.refresh();
  }

  constructor(peer: Peer) {
    this.#peer = peer;
    this.send(JSON.stringify({ op: "reconnect", data: this.reconnect }));
  }

  private refresh() {
    this.#reconnect = randomUUID();
    this.send(JSON.stringify({ op: "reconnect", data: this.reconnect }));
  }

  send(message: any) {
    this.#peer.send(message);
  }
}
