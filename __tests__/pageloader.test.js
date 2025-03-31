/* eslint fp/no-mutation:  */

import * as fs from 'node:fs/promises';
import * as prettier from 'prettier';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import nock from 'nock';

import download from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let tempUrl;
let outputDir;

beforeAll(async () => {
  tempUrl = 'https://ru.hexlet.io/courses';
  const rawHtml = await fs.readFile(getFixturePath('raw.html'), 'utf-8');
  const coursesHtml = await fs.readFile(getFixturePath('courses.html'), 'utf-8');
  const imageFile = await fs.readFile(getFixturePath('nodejs.png'));
  const scriptFile = await fs.readFile(getFixturePath('runtime.js'), 'utf-8');
  const styleFile = await fs.readFile(getFixturePath('application.css'), 'utf-8');

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, rawHtml)
    .get('/assets/professions/nodejs.png')
    .reply(200, imageFile)
    .get('/assets/application.css')
    .reply(200, styleFile)
    .get('/packs/js/runtime.js')
    .reply(200, scriptFile);

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, coursesHtml);
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('download page and assets', async () => {
  const expectedHtml = await fs.readFile(getFixturePath('expected.html'), 'utf-8');

  const [pageFilepath, assetsDir] = await download(tempUrl, outputDir);
  const actualHtml = await fs.readFile(pageFilepath, 'utf-8');
  const prettyActualHtml = await prettier.format(actualHtml, { parser: 'html' });
  const prettyExpectedHtml = await prettier.format(expectedHtml, { parser: 'html' });
  expect(prettyActualHtml).toEqual(prettyExpectedHtml);

  const assetDirContent = await fs.readdir(assetsDir);
  expect(assetDirContent).toHaveLength(4);
});

test('directory does not exist', async () => {
  const undefinedDirectory = 'path/to/undefined/directory';
  expect.assertions(1);

  await expect(download(tempUrl, undefinedDirectory)).rejects.toThrow();
  await fs.rmdir(outputDir);
});

test('page does not exist or is unavailable', async () => {
  const fakeUrl = 'https://this.site.com/does/not/exist';

  await expect(download(fakeUrl, outputDir)).rejects.toThrow();
  await fs.rmdir(outputDir);
});
