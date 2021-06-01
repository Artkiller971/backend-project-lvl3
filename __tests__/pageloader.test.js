import { promises as fs } from 'fs';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import downloadPage from '../src/getPageHtml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.resolve(__dirname, `__fixtures__/${filename}`);

const testFile = getFixturePath('test.html');
const expectedFile = getFixturePath('test_expected.html');

const server = 'https://host';
const page = '/test';

let outputDir;

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
});

test('downloadPage', async () => {
  nock(server)
    .get(page)
    .replyWithFile(200, testFile, { 'Content-Type': 'text/html' });

  const testUrl = `${server}${page}`;
  await downloadPage(testUrl, outputDir);

  const expected = await fs.readFile(expectedFile);
  const actual = await fs.readFile(`${outputDir}/host-test.html`);
  expect(actual.toString()).toBe(expected.toString());
});
