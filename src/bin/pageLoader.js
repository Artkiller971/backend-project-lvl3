#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import downloadPage from '../index.js';
import render from '../render.js';

const getFullPath = (pathname = '') => path.resolve(process.cwd(), pathname);

program
  .version('0.0.1', '-v, --version')
  .description('Page loader utility.')
  .option('--output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url) => {
    const dest = getFullPath(program.opts().output);
    downloadPage(url, dest, render)
      .then((filename) => console.log(`\n${filename} was successfuly downloaded to ${dest}`))
      .catch((e) => {
        console.error(e.message);
        process.exitCode = 1;
      });
  })
  .parse(process.argv);
