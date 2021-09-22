import * as jest from 'jest'

const argv = process.argv.slice(2)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
jest.run(['--runInBand', ...argv])
