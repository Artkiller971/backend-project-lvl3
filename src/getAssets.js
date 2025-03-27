import * as cheerio from 'cheerio';
import { URL } from 'node:url';

import { getAssetName, getDirectoryName } from './utils.js';

const tagToAttrMapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export default (html, url) => {
  const dirname = getDirectoryName(url);

  const $ = cheerio.load(html);

  const result = Object.keys(tagToAttrMapping)
    .flatMap((tag) => (
      $(tag).map((index, element) => {
        const current = $(element).attr(tagToAttrMapping[tag]);

        const { origin: currentOrigin } = new URL(url);
        const assetLink = new URL(current, currentOrigin);
        if (assetLink.origin === currentOrigin) {
          const newSrc = dirname + getAssetName(assetLink.origin + assetLink.pathname);
          $(element).attr(tagToAttrMapping[tag], newSrc);

          return { link: assetLink.href, tag };
        }
        return [];
      }).get()
    ));

  return [ $.html(), result ];
};
