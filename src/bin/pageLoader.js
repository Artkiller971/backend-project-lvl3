#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import downloadPage from '../getPageHtml.js';

const getFullPath = (pathname = '') => path.resolve(process.cwd(), pathname);

program
  .version('0.0.1', '-v, --version')
  .description('Page loader utility.')
  .option('--output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url) => {
    downloadPage(url, getFullPath(program.opts().output))
      .then((filepath) => console.log(filepath));
  })
  .parse(process.argv);
