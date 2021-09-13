import { config } from 'dotenv'
import { resolve } from 'path'

const { NODE_ENV = 'production' } = process.env

if (NODE_ENV === 'development') {
  const path = resolve(process.cwd(), '.env.development')

  config({ path })
} else if (NODE_ENV === 'test') {
  const path = resolve(process.cwd(), '.env.test')

  config({ path })
}
