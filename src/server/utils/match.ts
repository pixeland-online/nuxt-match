import { Dispatcher } from "./dispatcher";
import { Updater } from "./updater";
import { randomUUID, type UUID } from "crypto";
import type { Peer, Message } from "crossws";
import { Client, type ClientRaw } from "./client";

export type EventLeave = { type: "LEAVE"; client: ClientRaw["clientId"] };
export type EventJoin = { type: "JOIN"; client: ClientRaw["clientId"] };
export type EventMessage = {
  type: "MESSAGE";
  client: ClientRaw["clientId"];
  message: Message;
};

export type MatchOptions = {};

export type MatchMessage = { client: ClientRaw["clientId"]; message: Message };

export type MatchReconnect = {
  client: Client;
  timeout: NodeJS.Timeout;
};

export type MatchHandler<T extends MatchState> = {
  init(options: MatchOptions): { state: T; tickrate: number };
  update(
    state: T,
    dispatcher: Dispatcher,
    tick: number,
    messages: MatchMessage[]
  ): T | null;
  join(
    state: T,
    dispatcher: Dispatcher,
    tick: number,
    clients: ClientRaw["clientId"][]
  ): T;
  join_attempt(
    state: T,
    dispatcher: Dispatcher,
    tick: number,
    client: ClientRaw["clientId"]
  ): boolean;
  leave(
    state: T,
    dispatcher: Dispatcher,
    tick: number,
    clients: ClientRaw["clientId"][]
  ): T;
  signal<R extends void>(
    state: T,
    dispatcher: Dispatcher,
    tick: number,
    data: any
  ): { state: T | null; result?: R };
};

export type MatchState = {};

export class Match {
  static instances: Array<Match> = [];

  #id = randomUUID();
  #name: string;
  #updater: Updater;
  #dispatcher: Dispatcher;
  #handler: MatchHandler<MatchState>;
  #state: MatchState = {};
  #clients: Array<Client> = [];
  #events: Array<EventJoin | EventLeave | EventMessage> = [];
  #reconnects: Record<string, MatchReconnect> = {};

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get clients() {
    return this.#clients;
  }

  get tick() {
    return this.#updater.tick
  }

  constructor(
    name: string,
    handler: MatchHandler<MatchState>,
    options: MatchOptions = {}
  ) {
    this.#name = name;
    this.#updater = new Updater(this.update.bind(this));
    this.#dispatcher = new Dispatcher(this);
    this.#handler = handler;
    this.start(options);
  }

  private update(tick: number) {
    const events = this.#events.slice(0, this.#events.length);

    const joines = events.filter(
      (event) => event.type == "JOIN"
    ) as EventJoin[];
    const leaves = events.filter(
      (event) => event.type == "LEAVE"
    ) as EventLeave[];
    const messages = events.filter(
      (event) => event.type == "MESSAGE"
    ) as EventMessage[];

    let state = this.#state;

    if (joines.length > 0) {
      state = this.#handler.join(
        state,
        this.#dispatcher,
        tick,
        joines.map((event) => event.client)
      );
    }

    if (leaves.length > 0) {
      state = this.#handler.leave(
        state,
        this.#dispatcher,
        tick,
        leaves.map((event) => event.client)
      );
    }

    this.#events = [];

    const update = this.#handler.update(
      state,
      this.#dispatcher,
      tick,
      messages.map(({ client, message }) => ({ client, message }))
    );

    for (let client of this.#clients) {
      if (!this.#reconnects[client.reconnect]) {
        client.update()
      }
    }

    if (update == null) {
      this.stop();
    } else {
      this.#state = update || state;
    }
  }

  start(options: MatchOptions) {
    const { state, tickrate } = this.#handler.init(options);
    this.#state = state;
    this.#updater.start(tickrate);
    Match.instances.push(this);
  }

  stop() {
    // Stop update match
    this.#updater.stop();

    // Clear reconnects
    for (let recconect in this.#reconnects) {
      const { timeout } = this.#reconnects[recconect];
      clearTimeout(timeout);
    }

    // Remove instance match
    const index = Match.instances.findIndex((match) => match.id == this.id);
    Match.instances.slice(index, 1);
  }

  join(peer: Peer, reconnect?: UUID) {
    if (reconnect) {
      if (!this.#reconnects[reconnect]) {
        throw new Error("No found client reconnected");
      }

      const { client, timeout } = this.#reconnects[reconnect];

      delete this.#reconnects[reconnect];
      clearTimeout(timeout);
      client.refresh(peer)

      return;
    }

    if (this.hasClientByPeer(peer)) {
      throw new Error("Dublicate client peer");
    }

    const client = new Client(this, peer);

    if (
      this.#handler.join_attempt(
        this.#state,
        this.#dispatcher,
        this.#updater.tick,
        client.id
      )
    ) {
      this.#clients.push(client);
      this.#events.push({ client: client.id, type: "JOIN" });
      // Send message reconnect uuid
    }
  }

  leave(peer: Peer, recconect: number | false = false) {
    const client = this.findClientByPeer(peer);

    if (!client) {
      return;
    }

    const remove = () => {
      this.#clients = this.#clients.filter((c) => c.peerId != peer.id);
      this.#events.push({ client: client.id, type: "LEAVE" });
    };

    if (typeof recconect == "number") {
      this.#reconnects[client.reconnect] = {
        client,
        timeout: setTimeout(() => {
          delete this.#reconnects[client.reconnect];
          remove();
        }, recconect),
      };

      return;
    }

    remove();
  }

  message(peer: Peer, message: Message) {
    const client = this.findClientByPeer(peer);

    if (!client) {
      return;
    }

    this.#events.push({
      client: client.id,
      message,
      type: "MESSAGE",
    });
  }

  signal<T extends void>(data: any) {
    const { state, result } = this.#handler.signal<T>(
      this.#state,
      this.#dispatcher,
      this.#updater.tick,
      data
    );

    if (state == null) {
      this.stop();
    } else {
      this.#state = state || this.#state;
    }

    return result;
  }

  hasClient(id: UUID) {
    return !!this.findClient(id);
  }

  findClient(id: UUID) {
    for (let client of this.clients) {
      if (client.id == id) {
        return client;
      }
    }

    return null;
  }

  hasClientByPeer(peer: Peer) {
    return !!this.findClientByPeer(peer);
  }

  findClientByPeer(peer: Peer) {
    for (let client of this.clients) {
      if (client.peerId == peer.id) {
        return client;
      }
    }

    return null;
  }
}
