import { REST } from '@discordjs/rest'
import { Habitat } from '@habitat'
import { EnforceClientData } from '@myTypes/enforceData'
import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v9'
import { Routes } from 'discord-api-types/v9'
import { Client, ClientOptions, ClientUser, Intents } from 'discord.js'
import memoize from 'lodash/memoize'

import { enforceCommands } from './command'

export const enforceClient = async (
  data: EnforceClientData,
  habitat: Habitat
): Promise<Client> => {
  const client = await maybeCreateClient(data.token, data.options)

  if (data.commands) {
    await enforceCommands(data.commands, client, habitat)
  }

  if (data.userData) {
    const user = await getClientUser(client)
    user.edit(data.userData)
  }

  return client
}

const maybeCreateClient = memoize(
  async (token: string, options?: ClientOptions): Promise<Client> => {
    const intents = new Intents(REQUIRED_INTENTS)
    if (options?.intents) intents.add(options.intents)

    options = {
      ...options,
      intents,
    }

    const client = new Client(options)

    client.login(token)

    // Wait for the client to be ready before returning.
    await getClientUser(client)

    return client
  }
)

export const getClient = maybeCreateClient

// NOTE(https://bit.ly/3CURQRs): Client.application doesn't get populated, so
// make a request for application info.
export const getClientApplication = async (
  clientOrToken: string | Client
): Promise<RESTGetAPIOAuth2CurrentApplicationResult> => {
  const client = await getClientFromClientOrToken(clientOrToken)
  const user = await getClientUser(client)

  if (!client.token) {
    throw new Error('Could not find client token for client: ' + user.id)
  }

  const rest = new REST({ version: '9' }).setToken(client.token)

  return (await rest.get(
    Routes.oauth2CurrentApplication()
  )) as RESTGetAPIOAuth2CurrentApplicationResult
}

export const getClientUser = async (
  clientOrToken: string | Client
): Promise<ClientUser> => {
  const client = await getClientFromClientOrToken(clientOrToken)

  if (client.isReady() as boolean) {
    if (!client.user) {
      throw new Error('Could not find user for client.')
    }

    return client.user
  }

  return new Promise((res, rej) => {
    const onError = () => rej(client.user!)

    client.on('ready', () => {
      if (!client.user) {
        throw new Error(`Could not find user for client.`)
      }

      res(client.user)
      client.off('error', onError)
    })

    client.on('error', onError)
  })
}

const getClientFromClientOrToken = async (
  clientOrToken: string | Client
): Promise<Client> => {
  let client: Client

  // If a token was provided, resolve a client first.
  if (typeof clientOrToken === 'string') {
    const token = clientOrToken
    client = await getClient(token)
  } else {
    client = clientOrToken
  }

  return client
}

export const getFullClientName = async (
  clientOrToken: string | Client
): Promise<string> => {
  const client = await getClientFromClientOrToken(clientOrToken)
  const user = await getClientUser(client)

  let appName: string = ''
  try {
    const application = await getClientApplication(client)
    appName = application.name || ''
  } catch (err) {
    console.warn(err)
  }

  const userName = user.username

  if (!appName || appName === userName) {
    return userName
  }

  return `${appName} (${userName})`
}

export const getInviteUri = (clientId: string, guildId?: string) => {
  let uri = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=applications.commands%20bot`

  if (guildId) {
    uri += '&guild_id=' + guildId
    uri += '&disable_guild_select=true'
  }

  return uri
}

const REQUIRED_INTENTS: readonly number[] = [Intents.FLAGS.GUILDS]

const REQUIRED_PERMISSIONS: readonly number[] = []
