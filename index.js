import axios from 'axios';
import * as fs from 'node:fs/promises';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import process from 'node:process';

import download from './src/download.js';
import getAssets from './src/getAssets.js';

const log = debug('page-loader');
axiosDebug(axios);

export default (url, outputDir = process.cwd()) => {
  log('Trying to access the directory');

  return fs.access(outputDir)
    .then(() => axios.get(url))
    .then(({ data }) => {
      log(`Trying to download: ${url}`);
      return getAssets(data, url);
    })
    .then(([resultHtml, assets]) => download(assets, url, resultHtml, outputDir))
    .then(([pageFilepath, assetsDir]) => [pageFilepath, assetsDir])
    .catch((e) => {
      if (e.code === 'ENOENT') {
        throw new Error('Provided directory does not exist');
      } else if (e.code === 'EACESS') {
        throw new Error('You do not have access to write to the provided directory');
      } else if (e.code === 'ENOTFOUND') {
        throw new Error('Provided link is not valid');
      }

      throw new Error(e);
    });
};
