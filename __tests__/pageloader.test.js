import { promises as fs } from 'fs';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import downloadPage from '../src/getPageHtml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.resolve(__dirname, `__fixtures__/${filename}`);

const resources = {
  img: { url: '/assets/professions/nodejs.png', file: getFixturePath('img/image.png'), contentType: 'image/png' },
  js: { url: '/packs/js/runtime.js', file: getFixturePath('js/script.js'), contentType: 'text/plain' },
  css: { url: '/assets/application.css', file: getFixturePath('css/style.css'), contentType: 'text/plain' },
  html: { url: '/assets', file: getFixturePath('html/index.html'), contentType: 'text/plain' },
};

const testFile = getFixturePath('test.html');
const expectedFile = getFixturePath('test_expected.html');

const server = 'https://ru.hexlet.io';
const page = '/courses';

let outputDir;
let srcHtml;

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  srcHtml = await fs.readFile(testFile);

  nock(server)
    .get(page)
    .reply(200, srcHtml);

  Object.keys(resources).forEach((key) => {
    const { url, file, contentType } = resources[key];
    nock(server)
      .get(url)
      .replyWithFile(
        200,
        file,
        { 'Content-type:': contentType },
      );
  });
});

test('downloadPage', async () => {
  const testUrl = `${server}${page}`;
  await downloadPage(testUrl, outputDir);

  const outputDirFiles = await fs.readdir(outputDir);
  const assetsPath = path.join(outputDir, path.sep, 'ru-hexlet-io-courses_files');
  const assetFiles = await fs.readdir(assetsPath);
  const expected = await fs.readFile(expectedFile);
  const actual = await fs.readFile(`${outputDir}/ru-hexlet-io-courses.html`);
  expect(actual.toString()).toBe(expected.toString());
  expect(outputDirFiles).toHaveLength(2);
  expect(assetFiles).toHaveLength(4);
});
