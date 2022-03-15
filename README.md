# Habitat

_Habitat.js_ is a library for setting up, maintaining, and interacting with servers of multiple Discord bots.

The purpose of this library to assist in creating ecosystems out of Discord servers using a cast of bots. In other words, to build immersive server experiences where individual bots can represent their own characters or services, and interact with each other as well as humans just as a person might.

## Status

Unpublished.

## Usage

Create a habitat by instantiating one:

```ts
new Habitat(config: HabitatConfig)
```

When the habitat is instantiated, all the provided clients will be spun up.

Once any Discord server begins inviting the related clients, the server will be transformed into the shape of the instantiated habitat.

### Types

#### `HabitatConfig`

A `HabitatConfig` consists of many `Enforce Data` which each represent a piece of a server to enforce. An example interface for `HabitatConfig` is

```ts
interface HabitatConfig {
  clients: EnforceClientData[]
  channels: EnforceChannelData[]
  roles: EnforceRoleData[]
}
```

#### `Enforce Data`

`Enforce Data` are types that wrap Discord.js types. Everything in an `Enforce Data` interface represents what is needed to create an initial instance of that thing.

For example, the `EnforceClientData` interface is

```ts
interface EnforceClientData {
  options?: ClientOptions
  roles?: EnforceRoleData[]
  presence?: PresenceData
  token: string
  userData?: ClientUserEditData
}
```

The fields above encapsulate what is needed to initially create a client and set its appearance.

Note: Enforcement only runs when the server is started and when bots are first added to a server. Client appearances and other data in the server can still be set dynamically. _Habitat.js_ also provides helper methods for more complex bot behavior.

### Client setup

When creating clients in the Discord application portal, you'll need to give the each client the appropriate permissions in order for them to work with _Habitat.js_.

![Client permissions](docs/permissions.png)

Currently, _Habitat.js_ does not support the ability to narrow the scope of bot functionality i.e. narrowing the amount of permissions required.

## Development

### Installation

1. Clone or fork the repository.
2. Install Node. You can use [nvm](https://github.com/nvm-sh/nvm) or [the official download page](https://nodejs.org/en/download/).
   Make sure you download a version campatible with the latest stable version of Discord.js. Please reference [the Discord.js documentation](https://discord.js.org/#/docs/discord.js/stable/general/welcome).
3. Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable).
4. Navigate into the project folder and run `yarn`.
5. If you plan on running the demo, make sure to follow the instructions under [Client setup](#client-setup) to setup your clients.
6. Done!
