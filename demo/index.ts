import 'dotenv/config'

import { Habitat, SETUP_COMMAND } from '@habitat'

// Create tokens and fill them in here.
const adminToken = process.env.ADMIN_TOKEN || ''
const testToken1 = process.env.TEST_TOKEN_1 || ''

const habitat = new Habitat({
  admin: {
    commands: [SETUP_COMMAND],
    token: adminToken,
    userData: {
      username: 'Test Admin',
    },
  },
  clients: [
    {
      token: testToken1,
      userData: {
        username: 'I Not Robot',
      },
    },
  ],
})

const main = async () => {
  await habitat.getClients()
  console.log('Clients have started up!')
}

console.log('Starting up clients...')
main()
