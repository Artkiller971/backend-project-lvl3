import axios from 'axios';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import debug from 'debug';
import createPageFile from './createPageFile.js';
import { getAssetName, getDirectoryName } from './utils.js';

const log = debug('page-loader');

const downloadAsset = (url, outputDir) => {
  const filename = getAssetName(url);
  const filepath = path.resolve(outputDir, filename);
  return axios({
    method: 'get',
    url,
    responseType: 'stream',
  })
    .then(({ data }) => {
      log(`Downloading resouce: ${url}`);
      return fs.writeFile(filepath, data);
    })
    .catch(() => {
      console.error(`There was an error with the resouce: ${url}`);
    });
};

export default (assets, url, resultHtml, outputDir) => {
  const assetsDir = path.resolve(outputDir, getDirectoryName(url));

  log('Creating files directory');
  return fs.mkdir(assetsDir, { recursive: true })
    .then(() => assets.map(({ link }) => downloadAsset(link, assetsDir)))
    .then((promises) => Promise.all(promises))
    .then(() => createPageFile(resultHtml, url, outputDir))
    .then((pageFilepath) => [pageFilepath, assetsDir])
    .catch((e) => console.error(e));
};
