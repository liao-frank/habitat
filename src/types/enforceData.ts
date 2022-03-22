import { SlashCommandBuilder } from '@discordjs/builders'
import { Habitat } from '@habitat'
import {
  ClientOptions,
  ClientUserEditData,
  CommandInteraction,
  PartialRoleData,
} from 'discord.js'

export interface EnforceClientData {
  commands?: EnforceCommandData[]
  options?: ClientOptions
  presence?: undefined // TODO: PresenceData
  roles?: undefined // TODO: EnforceRoleData[]
  token: string
  userData?: ClientUserEditData
}

export interface EnforceCommandData {
  command: SlashCommandBuilder
  handler: (interaction: CommandInteraction, habitat: Habitat) => void
}

export interface EnforceRoleData {
  data: PartialRoleData
}
