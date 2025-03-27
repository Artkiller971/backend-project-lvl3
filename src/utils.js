import { URL } from 'node:url';
import path from 'node:path';

export const getAssetName = (url) => {
  const { hostname, pathname } = new URL(url);
  const filename = path.extname(url) || '.html';
  const result = hostname + pathname;
  return result.replace(/\.\w+$/g, '').replace(/\W/g, '-') + filename;
};

export const getDirectoryName = (url) => {
  const { hostname, pathname } = new URL(url);
  const result = hostname + pathname;
  return result.replace(/\W+/g, '-').replace(/(\W|$)$/, '_files/');
};
