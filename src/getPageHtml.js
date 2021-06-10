import fs, { promises as fsp } from 'fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';

const log = debug('page-loader');

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
  const newExt = ext ?? '.html';
  return `${filename}${newExt}`;
};

const downloadPageHtml = (pageUrl) => axios.get(pageUrl).then((response) => response.data);

const downloadBinaryResource = (resourceUrl, filepath) => axios.get(resourceUrl, { responseType: 'stream' })
  .then((response) => response.data.pipe(fs.createWriteStream(filepath)));

const downloadTextResource = (resourceUrl, filepath) => axios.get(resourceUrl)
  .then((response) => fsp.writeFile(filepath, response.data));

const resourceTypes = {
  img: { attr: 'src', download: downloadBinaryResource },
  script: { attr: 'src', download: downloadTextResource },
  link: { attr: 'href', download: downloadTextResource },
};

const processAllTags = (url, htmlString, resourceDir) => {
  const assetUrls = [];
  const $ = cheerio.load(htmlString, { decodeEntities: false });
  const tags = Object.keys(resourceTypes);
  tags.forEach((tag) => {
    $(tag).each(function () {
      const oldSrc = $(this).attr(resourceTypes[tag].attr);
      if (oldSrc.startsWith('//')) {
        log('absolute url, skipping');
      } else {
        const assetUrl = new URL(oldSrc, url).href;
        const assetFilename = urlToFilenameWithExt(assetUrl);
        const assetFilepath = path.join(resourceDir, assetFilename);
        const assetDownloadFunction = resourceTypes[tag].download;
        assetUrls.push({ assetUrl, assetFilepath, assetDownloadFunction });
        console.log(assetFilepath);
        $(this).attr(resourceTypes[tag].attr, assetFilepath);
      }
    });
  });
  return { assetUrls, html: $.html() };
};

const downloadResources = (assetUrls, outputDir) => {
  assetUrls.forEach(({ assetUrl, assetFilepath, assetDownloadFunction }) => {
    assetDownloadFunction(assetUrl, path.join(outputDir, assetFilepath));
  });
};
const checkDirAccess = (dir) => fsp.access(dir);

export default (url, outputDir) => {
  const baseName = urlToFilenameWithoutExt(url);
  const filename = `${baseName}.html`;
  const resourceDir = `${baseName}_files`;
  const destFilepath = path.join(outputDir, filename);
  const resourcePath = path.join(outputDir, resourceDir);
  return checkDirAccess(outputDir)
    .then(() => fsp.mkdir(resourcePath))
    .then(() => downloadPageHtml(url))
    .then((data) => processAllTags(url, data, resourceDir))
    .then(({ assetUrls, html }) => fsp.writeFile(destFilepath, html).then(() => assetUrls))
    .then((assetUrls) => downloadResources(assetUrls, outputDir))
    .then(() => filename);
};
