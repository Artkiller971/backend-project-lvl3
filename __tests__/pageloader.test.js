/* eslint fp/no-mutation:  */

import * as fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import nock from 'nock';

import download from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const tempUrl = 'https://example.url.com/example/route';
let outputDir;

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('readFile', async () => {
  const expected = await fs.readFile(getFixturePath('example.html'), 'utf-8');

  nock('https://example.url.com')
    .get('/example/route')
    .reply(200, expected);

  const actualPath = await download(tempUrl, outputDir);
  const actual = await fs.readFile(actualPath, 'utf-8');
  expect(actual).toEqual(expected);
});
