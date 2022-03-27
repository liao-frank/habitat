import 'dotenv/config'

import { Habitat, SETUP_COMMAND } from '@habitat'
import fs from 'fs'

import merchantImage from './images/placeholder-fish-merchant.png'
import townImage from './images/placeholder-lake-town.png'

// Create tokens and fill them in here.
const adminToken = process.env.ADMIN_TOKEN || ''
const testToken1 = process.env.TEST_TOKEN_1 || ''

const habitat = new Habitat({
  admin: {
    commands: [SETUP_COMMAND],
    token: adminToken,
    userData: {
      username: 'Lakeport Town',
      avatar: fs.readFileSync(new URL(townImage)),
    },
  },
  clients: [
    {
      token: testToken1,
      userData: {
        username: 'Fish Phisher',
        avatar: fs.readFileSync(new URL(merchantImage)),
      },
      presence: {
        activities: [{ name: 'the fish market', type: 'WATCHING' }],
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
