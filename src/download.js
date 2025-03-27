import axios from 'axios';
import path from 'node:path';
import * as fs from 'node:fs/promises';

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
    .then(({ data }) => fs.writeFile(filepath, data))
    .catch(() => console.error('Unavailable resource'));
};

const downloadTextAsset = (url, outputDir) => {
  const filename = getAssetName(url);
  const filepath = path.resolve(outputDir, filename);
  return axios.get(url)
    .then(({ data }) => fs.writeFile(filepath, data, 'utf-8'))
    .catch(() => console.error('Unavailable resource'));
};

const getDownloadFunction = (tag) => {
  if (tag === 'img') {
    return downloadImageAsset;
  }
  return downloadTextAsset;
};

export default (assets, url, resultHtml, outputDir) => {
  const assetsDir = path.resolve(outputDir, getDirectoryName(url));

  return fs.mkdir(assetsDir)
    .then(() => assets.map(({ link, tag }) => getDownloadFunction(tag)(link, assetsDir)))
    .then((promises) => Promise.all(promises))
    .then(() => createPageFile(resultHtml, url, outputDir))
    .then((pageFilepath) => [pageFilepath, assetsDir])
    .catch((e) => console.error(e));
};
