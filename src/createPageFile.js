import { URL } from 'node:url';
import path from 'node:path';
import * as fs from 'node:fs/promises';

import debug from 'debug';

const log = debug('page-loader');

const getFileName = (url) => {
  const { hostname, pathname } = new URL(url);
  const result = hostname + pathname;
  return `${result.replace(/\W+/g, '-')}.html`;
};

export default (html, url, outputDir) => {
  const filename = getFileName(url);
  const filepath = path.resolve(outputDir, filename);
  log('Creating html file');
  return fs.writeFile(filepath, html)
    .then(() => filepath);
};
