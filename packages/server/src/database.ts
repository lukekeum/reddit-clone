import 'pg'
import { ConnectionOptions, createConnection, Connection } from 'typeorm'
import entities from './entities'

export class Database {
  private _connectionOptions: ConnectionOptions

  constructor() {
    this._initialOptions()
  }

  private _initialOptions() {
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

  public connect(connectionOptions?: ConnectionOptions): Promise<Connection> {
    return createConnection(connectionOptions || this._connectionOptions)
  }
}
