import axios from 'axios';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import debug from 'debug';

const log = debug('page-loader');

import createPageFile from './createPageFile.js';

import { getAssetName, getDirectoryName } from './utils.js';

const downloadImageAsset = (url, outputDir) => {
  const filename = getAssetName(url);
  const filepath = path.resolve(outputDir, filename);
  return axios({
    method: 'get',
    url: url,
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

const downloadTextAsset = (url, outputDir) => {
  const filename = getAssetName(url);
  const filepath = path.resolve(outputDir, filename);
  return axios.get(url)
    .then(({ data }) => {
      log(`Downloading resouce: ${url}`);
      return fs.writeFile(filepath, data, 'utf-8');
    })
    .catch(() => {
      console.error(`There was an error with the resouce: ${url}`);
    });
};

const getDownloadFunction = (tag) => {
  if (tag === 'img') {
    return downloadImageAsset;
  }
  return downloadTextAsset;
};

export default (assets, url, resultHtml, outputDir) => {
  const assetsDir = path.resolve(outputDir, getDirectoryName(url));

  log('Creating files directory');
  return fs.mkdir(assetsDir, { recursive:true })
    .then(() => assets.map(({ link, tag }) => getDownloadFunction(tag)(link, assetsDir)))
    .then((promises) => Promise.all(promises))
    .then(() => createPageFile(resultHtml, url, outputDir))
    .then((pageFilepath) => [pageFilepath, assetsDir])
    .catch((e) => console.error(e));
};
