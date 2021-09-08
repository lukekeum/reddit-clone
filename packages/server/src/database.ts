import 'pg'
import {
  ConnectionOptions,
  createConnection,
  Connection,
  getConnection,
} from 'typeorm'
import entities from './entities'

export class Database {
  _connectionOptions: ConnectionOptions

  constructor() {
    this._initialOptions()
  }

  _initialOptions(): void {
    /* eslint-disable */
    this._connectionOptions = {
      entities,
      type: process.env.TYPEORM_TYPE as any,
      host: process.env.TYPEORM_HOST,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
      dropSchema: process.env.TYPEORM_DROPSCHEMA === 'true',
      synchronize: process.env.TYPEORM_SYNCRONIZE === 'true',
      logging: process.env.TYPEORM_LOGGING === 'true',
    }
    /* eslint-enable */
  }

  connect(connectionOptions?: ConnectionOptions): Promise<Connection> {
    return createConnection(connectionOptions || this._connectionOptions)
  }

  static async close(connectionName: string): Promise<boolean> {
    try {
      const conn = getConnection(connectionName)

      await conn.close()

      return true
    } catch (err) {
      return false
    }
  }
}
