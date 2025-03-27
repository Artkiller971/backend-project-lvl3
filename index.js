import axios from 'axios';

import download from './src/download.js';
import getAssets from './src/getAssets.js';

export default (url, outputDir) => (
  axios.get(url)
    .then(({ data }) => getAssets(data, url))
    .then(([resultHtml, assets]) => download(assets, url, resultHtml, outputDir))
    .then(([pageFilepath, assetsDir]) => [pageFilepath, assetsDir])
    .catch((e) => console.error(e))
);
