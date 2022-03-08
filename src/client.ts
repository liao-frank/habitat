import { EnforceClientData } from '@myTypes/enforceData'
import {
  BitFieldResolvable,
  Client,
  ClientOptions,
  Intents,
  IntentsString,
} from 'discord.js'
import memoize from 'lodash/memoize'

export const enforceClient = (data: EnforceClientData) => {
  const { options, token, userData } = data
  const client = maybeCreateClient(token, options)

  if (userData) {
    if (client.isReady() as boolean) {
      client.user?.edit(userData)
    } else {
      client.on('ready', () => {
        client.user?.edit(userData)
      })
    }
  }

  return client
}

const maybeCreateClient = memoize(
  (token: string, options?: ClientOptions): Client => {
    const intents = new Intents(REQUIRED_INTENTS)
    if (options?.intents) intents.add(options.intents)

    options = {
      ...options,
      intents,
    }

    const client = new Client(options)
    client.login(token)

    return client
  }
)
export const getClient = maybeCreateClient

const REQUIRED_INTENTS: BitFieldResolvable<IntentsString, number> = [
  Intents.FLAGS.GUILDS,
]
