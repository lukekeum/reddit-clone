import 'pg'
import {
  ConnectionOptions,
  createConnection,
  Connection,
  getConnection,
} from 'typeorm'
import entities from './entities'

export class Database {
  constructor(private connectionOptions?: ConnectionOptions) {
    this.connectionOptions || void this._initialOptions()
  }

  _initialOptions(): void {
    /* eslint-disable */
    this.connectionOptions = {
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
      cache: {
        type: 'redis',
        options: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          duration: 1000 * 30, // 30 seconds
        },
      },
    }
    /* eslint-enable */
  }

  connect(connectionOptions?: ConnectionOptions): Promise<Connection> {
    return createConnection(
      (connectionOptions || this.connectionOptions) as ConnectionOptions
    )
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
