import { config } from 'dotenv'
import { resolve } from 'path'

const { NODE_ENV = 'production' } = process.env

if (NODE_ENV === 'development') {
  const path = resolve(process.cwd(), '.env.development')

  config({ path })
}
