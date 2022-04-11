import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import {
  Client,
  CommandInteraction,
  DiscordAPIError,
  Interaction,
  PermissionResolvable,
  Permissions,
} from 'discord.js'
import memoize from 'lodash/memoize'
import { v5 as uuidv5 } from 'uuid'

import { Habitat } from '../habitat'
import { getClientUser, getFullClientName, getInviteUri } from './client'

const clientToCommandConfigsMap = new Map<Client, CommandConfig[]>()

export const enforceCommands = async (
  configs: CommandConfig[],
  client: Client,
  habitat: Habitat
): Promise<void> => {
  clientToCommandConfigsMap.set(client, configs)

  const user = await getClientUser(client)

  if (!client.token) {
    throw new Error('Could not find client token for client: ' + user.id)
  }

  const rest = new REST({ version: '9' }).setToken(client.token)

  await rest.put(Routes.applicationCommands(user.id), {
    body: configs.map((config) => config.command),
  })

  // Calling 'off' first ensures that the singleton handler only gets added once
  // per client.
  client.off('interactionCreate', getSingletonHandler(client, habitat))

  client.on('interactionCreate', getSingletonHandler(client, habitat))
}

const getSingletonHandler = memoize(
  (client: Client, habitat: Habitat): ((interaction: Interaction) => void) => {
    return (interaction) => {
      if (!interaction.isCommand()) return

      if (client !== interaction.client) {
        throw new Error(
          `Expected handling client (${client.user?.id}) to equal receiving client (${interaction.client.user?.id}).`
        )
      }

      const configs = clientToCommandConfigsMap.get(client) || []
      for (const config of configs) {
        if (interaction.commandName === config.command.name) {
          config.handler(interaction, habitat)
          return
        }
      }

      // If no handler was found, reply with basic message and throw. Though,
      // this should never happen.
      interaction.reply({
        content: '', // TODO: Add basic message.
        ephemeral: true,
      })
      throw new Error(
        'Could not find handler for command: ' + interaction.commandName
      )
    }
  },
  (client, habitat) => {
    if (!client.user) {
      throw new Error('Could not find user for client.')
    }

    const name = client.user?.id + JSON.stringify(habitat.config)
    return uuidv5(name, UUID_NAMESPACE)
  }
)

export const SETUP_COMMAND: CommandConfig = {
  command: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Manually runs server setup for Habitat.js'),
  handler: async (interaction, habitat) => {
    const { guild } = interaction
    const permissions = interaction.memberPermissions || new Permissions()

    if (!guild) {
      await interaction.reply({
        content: 'This command only works in a server.',
        ephemeral: true,
      })
      return
    }

    if (!permissions.has(SETUP_COMMAND_PERMISSIONS)) {
      await interaction.reply({
        content:
          'Missing permissions to use this command:\n' +
          permissions
            .missing(SETUP_COMMAND_PERMISSIONS)
            .map((str) => `- \`${str}\``)
            .join('\n'),
        ephemeral: true,
      })
      return
    }

    await interaction.deferReply({ ephemeral: true })

    const clients = await habitat.getClients()
    const users = await Promise.all(getClientUser(clients))
    const missingUsers = []

    for (const user of users) {
      let missing: boolean
      try {
        await guild.members.fetch(user)
        missing = false
      } catch (unknownError) {
        const error = unknownError as DiscordAPIError

        // NOTE(https://discord.com/developers/docs/topics/opcodes-and-status-codes#json): Unknown member error.
        if (error.code === 10007) {
          missing = true
        } else {
          const message =
            'An error occurred when looking through the server members for missing bots.'
          await interaction.editReply(message)
          return
        }
      }

      if (missing) {
        missingUsers.push(user)
      }
    }

    if (missingUsers.length) {
      const uris = await Promise.all(
        missingUsers.map(async (user) => {
          const name = await getFullClientName(user.client)
          const uri = getInviteUri(user.id, interaction.guildId!)
          return `- [${name}](${uri})`
        })
      )

      const message =
        'Found missing bot[s]. Use the following links to invite them, then ' +
        'rerun this command.\n' +
        uris

      await interaction.editReply(message)
      return
    }

    try {
      // TODO: await habitat.enforceGuild(guild)
    } catch (err) {
      const message = 'An error occurred: ' + (err as any).toString()
      await interaction.editReply(message)
      return
    }

    await interaction.editReply('Finished.')
  },
}

export interface CommandConfig {
  command: SlashCommandBuilder
  handler: (interaction: CommandInteraction, habitat: Habitat) => void
}

const SETUP_COMMAND_PERMISSIONS: PermissionResolvable[] = [
  Permissions.FLAGS.MANAGE_CHANNELS,
  Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
  Permissions.FLAGS.MANAGE_GUILD,
  Permissions.FLAGS.MANAGE_MESSAGES,
  Permissions.FLAGS.MANAGE_ROLES,
]

const UUID_NAMESPACE = '6145a203-ebf1-4bb5-9daa-c649842f6ff8'
