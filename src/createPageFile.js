import { URL } from 'node:url';
import path from 'node:path';
import * as fs from 'node:fs/promises';

const getFileName = (url) => {
  const { hostname, pathname } = new URL(url);
  const result = hostname + pathname;
  return `${result.replace(/\W+/g, '-')}.html`;
};

export default (html, url, outputDir) => {
  const filename = getFileName(url);
  const filepath = path.resolve(outputDir, filename);
  return fs.writeFile(filepath, html)
    .then(() => filepath);
};
