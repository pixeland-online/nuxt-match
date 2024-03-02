export class Updater {
  #runner: NodeJS.Timeout | null = null;
  #update: (tick: number) => void;
  #tick: number = 0;

  get tick() {
    return this.#tick;
  }

  constructor(update: (tick: number) => void) {
    this.#update = update;
  }

  start(tickrate: number) {
    this.stop();
    const rate = 1000 / Math.max(1, Math.min(60, tickrate));
    this.#runner = setInterval(() => {
      this.#update(this.#tick);
      this.#tick++;
    }, rate);
  }

  stop() {
    if (this.#runner) clearInterval(this.#runner);
  }
}
