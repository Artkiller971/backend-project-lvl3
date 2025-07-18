import { program } from 'commander'
import process from 'node:process'

import pageloader from '../index.js'

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')

program
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url, outputDir) => {
    pageloader(url, outputDir.output)
      .then(([path]) => {
        console.log(`Located in ${path}`)
        process.exit(0)
      })
      .catch((error) => {
        console.error(error.message)
        process.exit(-1)
      })
  })

export default () => program.parse(process.argv)
