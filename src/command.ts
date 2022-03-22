import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import {
  Habitat,
  getClientUser,
  getFullClientName,
  getInviteUri,
} from '@habitat'
import { EnforceCommandData } from '@myTypes/enforceData'
import { Routes } from 'discord-api-types/v9'
import {
  Client,
  Interaction,
  PermissionResolvable,
  Permissions,
} from 'discord.js'
import memoize from 'lodash/memoize'
import { v5 as uuidv5 } from 'uuid'

const clientToDatasMap = new Map<Client, EnforceCommandData[]>()

export const enforceCommands = async (
  datas: EnforceCommandData[],
  client: Client,
  habitat: Habitat
): Promise<void> => {
  clientToDatasMap.set(client, datas)

  const user = await getClientUser(client)

  if (!client.token) {
    throw new Error('Could not find client token for client: ' + user.id)
  }

  const rest = new REST({ version: '9' }).setToken(client.token)

  await rest.put(Routes.applicationCommands(user.id), {
    body: datas.map((data) => data.command),
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

      const datas = clientToDatasMap.get(client) || []
      for (const data of datas) {
        if (interaction.commandName === data.command.name) {
          data.handler(interaction, habitat)
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

export const SETUP_COMMAND: EnforceCommandData = {
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

    const users = await habitat.getClientUsers()
    const missingUsers = []

    for (const user of users) {
      const missing = !(await guild.members.fetch(user))
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
      await habitat.enforceGuild(guild)
    } catch (err) {
      const message = 'An error occurred: ' + (err as any).toString()
      await interaction.editReply(message)
      return
    }

    await interaction.editReply('Finished.')
  },
}

const SETUP_COMMAND_PERMISSIONS: PermissionResolvable[] = [
  Permissions.FLAGS.MANAGE_CHANNELS,
  Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
  Permissions.FLAGS.MANAGE_GUILD,
  Permissions.FLAGS.MANAGE_MESSAGES,
  Permissions.FLAGS.MANAGE_ROLES,
]

const UUID_NAMESPACE = '6145a203-ebf1-4bb5-9daa-c649842f6ff8'
