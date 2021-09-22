import { createLogger, transports, format } from 'winston'

const { NODE_ENV } = process.env

interface TransformInfo {
  level: string
  message: string
  [key: string]: unknown
}

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack })
  }
  return info
})

const logger = createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    NODE_ENV === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(
      (info: TransformInfo) =>
        `${info.timestamp as string} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
    }),
  ],
})

export default logger
