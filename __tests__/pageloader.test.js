import { promises as fs } from 'fs';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import downloadPage from '../src/getPageHtml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, `__fixtures__/${filename}`);

// const resources = {
// img: { url: '/img/test.png', file: getFixturePath('img/nodejs.png'), contentType: 'image/png' },
// };

const testFile = getFixturePath('test.html');
const expectedFile = getFixturePath('test_expected.html');

const server = 'https://ru.hexlet.io';
const page = '/';

let outputDir;
let imageAsset;
let srcHtml;

beforeAll(async () => {
  imageAsset = await fs.readFile(getFixturePath('nodejs.png'));
  srcHtml = await fs.readFile(testFile);

  nock(server)
    .get('/nodejs.png')
    .reply(200, imageAsset);

  nock(server)
    .get(page)
    .reply(200, srcHtml);
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
});

test('downloadPage', async () => {
  await downloadPage(server, outputDir);

  const expected = await fs.readFile(expectedFile);
  const actual = await fs.readFile(`${outputDir}/ru-hexlet-io.html`);
  expect(actual.toString()).toBe(expected.toString());
});
