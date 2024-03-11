const puppeteer = require("puppeteer");

const EXTENSION_PATH = "../chrome-extension-website-blocker";
const EXTENSION_ID = "cfjfcaooomnpocpndljgpcbfabjclpnn";

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    // Set to 'new' to hide Chrome if running as part of an automated build.
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

test("the two preset URLs are visible", async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`);

  const list = await page.$("ul");
  const children = await list.$$("li");

  expect(children.length).toBe(2);
});
