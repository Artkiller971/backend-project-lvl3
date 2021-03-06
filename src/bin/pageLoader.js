#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import downloadPage from '../index.js';

const getFullPath = (pathname = '') => path.resolve(process.cwd(), pathname);

program
  .version('0.0.1', '-v, --version')
  .description('Page loader utility.')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url) => {
    try {
      const dest = getFullPath(program.opts().output);
      downloadPage(url, dest)
        .then((filename) => {
          console.log(`\n${filename} was successfuly downloaded to ${dest}`);
          process.exit();
        })
        .catch((e) => {
          console.error(e.message);
          process.exit(1);
        });
    } catch (e) {
      console.error(e.message);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
