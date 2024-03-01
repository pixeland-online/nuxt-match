import { randomUUID, type UUID } from 'node:crypto'
import type { Match, MatchConfig, MatchHandler, MatchOptions, MatchState } from '../types/match'

//@ts-ignore
import { handlers } from '#internal/pixeland/virtual/handlers'

const matches: Record<UUID, Match<any>> = {}

export function definePixelandMatch<T extends MatchState>(config: MatchConfig<T>) {
  const handler: MatchHandler<T> = (options) => {
    const { state, tickrate, label } = config.init(options)

    const runner = setInterval(() => {
      const result = config.update(match.state, match.tick)

      if (!result && match) {
        clearInterval(match.runner)
        delete matches[match.uuid]
      }

      match.tick++
    }, 1000 / Math.max(1, Math.min(60, tickrate)))

    const match: Match<T> = { uuid: randomUUID(), state, tick: 0, label, config, runner }

    matches[match.uuid] = match

    return match
  }

  return handler
}

export function findPixelandMatch<T extends MatchState>(callback: (match: Match<T>) => boolean) {
  return Object.entries(matches).filter(([_, match]) => callback(match)).map(([_, match]) => match)
}

export async function createPixelandMatch<T extends MatchState>(name: string, options: MatchOptions = {}) {
  if (!handlers[name]) {
    throw new Error('No found handler match')
  }

  const target = handlers[name]
  const handler = await target.resolve()
  const match = handler(options) as Match<T>

  return match
}