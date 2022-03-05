import { Client, ClientOptions, Intents } from 'discord.js'
import appRootDir from 'app-root-dir'
import memoize from 'lodash/memoize'

import { getResolver } from '@lib/getResolver'
import { passthrough } from '@lib/passthrough'

export class SimpleClient {
  readonly client: Client
  readonly ready: Promise<void>

  private constructor(
    token: string,
    options: ClientOptions = { intents: DEFAULT_INTENTS }
  ) {
    this.client = new Client(options)

    const { promise, resolver } = getResolver()
    this.ready = promise

    this.client.on('ready', resolver)
    this.client.login(token)
  }

  static get(clientName: string) {
    const config = getHabitatConfig()
    const token = config.tokens?.[clientName]

    if (!token) {
      throw new Error(
        `Could not find token for client: ${clientName}. Make sure it is configured correctly in the habitat config.`
      )
    }

    const simpleClient = new SimpleClient(token)

    if (!passthrough(simpleClient, simpleClient.client)) {
      throw new Error(`Failed to setup passthrough on SimpleClient: ${token}.`)
    }

    return simpleClient
  }
}

const getHabitatConfig = memoize((): HabitatConfig => {
  try {
    return require(appRootDir.get() + '/habitat.json')
  } catch (err) {
    const errAny = err as any
    if ('code' in errAny && errAny.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'Could not find habitat config (habitat.json) at project root.'
      )
    }
    throw err
  }
})

export type HabitatConfig = Partial<{
  tokens: {
    [clientName: string]: string
  }
}>

const DEFAULT_INTENTS: Intents = new Intents().add(Intents.FLAGS.GUILDS)
