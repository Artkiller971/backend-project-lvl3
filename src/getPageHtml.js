import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';

const urlToFilename = (url) => {
  const { hostname, pathname } = new URL(url);
  const hostnameAndPathname = `${hostname}${pathname}`;
  const result = hostnameAndPathname.replace(/\W/g, '-');
  return `${result}.html`;
};

// const writeFile = (filepath, data) => fs.writeFile(filepath, data);

const downloadPageHtml = (pageUrl) => axios.get(pageUrl).then((response) => response.data);

const checkDirAccess = (dir) => fs.access(dir);

export default (url, outputDir) => {
  const filepath = path.join(outputDir, urlToFilename(url));
  return checkDirAccess(outputDir)
    .then(() => downloadPageHtml(url))
    .then((data) => fs.writeFile(filepath, data))
    .then(() => filepath);
};
