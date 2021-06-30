import fs, { promises as fsp } from 'fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';
import 'axios-debug-log';

const log = debug('page-loader');
const logError = debug('page-loader:error');

const urlToFilenameWithoutExt = (url) => {
  const { host, pathname } = new URL(url);
  const hostnameAndPathname = `${host}${pathname}`;
  const filename = hostnameAndPathname.replace(/\W/g, '-').replace(/-$/, '');
  return filename;
};

const urlToFilenameWithExt = (url) => {
  const { ext } = path.parse(url);
  const urlWithoutExt = url.slice(0, url.length - ext.length);
  const filename = urlToFilenameWithoutExt(urlWithoutExt);
  const newExt = ext || '.html';
  return `${filename}${newExt}`;
};

const downloadPageHtml = (pageUrl) => axios.get(pageUrl).then((response) => response.data)
  .catch((e) => {
    logError(e.message);
    throw e;
  });

const downloadBinaryResource = (resourceUrl, filepath) => axios.get(resourceUrl, { responseType: 'stream' })
  .then((response) => response.data.pipe(fs.createWriteStream(filepath)))
  .catch((e) => {
    logError(e.message);
    throw e;
  });

const downloadTextResource = (resourceUrl, filepath) => axios.get(resourceUrl)
  .then((response) => fsp.writeFile(filepath, response.data))
  .catch((e) => {
    logError(e.message);
    throw e;
  });

const resourceTypes = {
  img: { attr: 'src', download: downloadBinaryResource },
  script: { attr: 'src', download: downloadTextResource },
  link: { attr: 'href', download: downloadTextResource },
};

const processAllTags = (url, htmlString, resourceDir) => {
  const assetUrls = [];
  const $ = cheerio.load(htmlString, { decodeEntities: false });
  const tags = Object.keys(resourceTypes);
  const urlHostname = new URL(url).hostname;
  tags.forEach((tag) => {
    $(tag).each((_i, el) => {
      const oldSrc = $(el).attr(resourceTypes[tag].attr);
      const srcHostname = new URL(oldSrc, url).hostname;
      if (srcHostname !== urlHostname) {
        log('absolute url, skipping');
      } else {
        log('url is relative, processing');
        const assetUrl = new URL(oldSrc, url).href;
        const assetFilename = urlToFilenameWithExt(assetUrl);
        log(`asset filename: ${assetFilename}`);
        const assetFilepath = path.join(resourceDir, assetFilename);
        log(`asset url: ${assetFilepath}`);
        const assetDownloadFunction = resourceTypes[tag].download;
        assetUrls.push({ assetUrl, assetFilename, assetDownloadFunction });
        $(el).attr(resourceTypes[tag].attr, assetFilepath);
      }
    });
  });
  return { assetUrls, html: $.html() };
};

const downloadResources = (assetUrls, resourcePath) => fsp.mkdir(resourcePath)
  .then(() => {
    log(`assets to save: ${assetUrls.length}`);
    const promises = assetUrls.map(({ assetUrl, assetFilename, assetDownloadFunction }) => {
      log(`saving ${assetFilename} to ${path.join(resourcePath, assetFilename)}`);
      return assetDownloadFunction(assetUrl, path.join(resourcePath, assetFilename));
    });
    return Promise.all(promises);
  });

const checkDirAccess = (dir) => fsp.access(dir);

export default (url, outputDir) => {
  const baseName = urlToFilenameWithoutExt(url);
  const filename = `${baseName}.html`;
  const resourceDir = `${baseName}_files`;
  const destFilepath = path.join(outputDir, filename);
  const resourcePath = path.join(outputDir, resourceDir);

  return checkDirAccess(outputDir)
    .then(() => {
      log(`downloading ${url}`);
      return downloadPageHtml(url);
    })
    .then((data) => processAllTags(url, data, resourceDir))
    .then(({ assetUrls, html }) => fsp.writeFile(destFilepath, html).then(() => assetUrls))
    .then((assetUrls) => {
      log(`donwloading local resouces to ${resourceDir}`);
      return downloadResources(assetUrls, resourcePath);
    })
    .then(() => filename)
    .catch((e) => {
      logError(e.message);
      throw e;
    });
};
