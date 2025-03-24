import { program } from 'commander';
import process from 'node:process';

import pageloader from '../index.js';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1');

program
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url, outputDir) => {
    pageloader(url, outputDir.output)
      .then((pathToFile) => console.log(pathToFile))
      .catch((error) => console.error(error));
  });

export default () => program.parse(process.argv);
