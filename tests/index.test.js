const puppeteer = require("puppeteer");

const EXTENSION_PATH = "../chrome-extension-website-blocker";
const EXTENSION_ID = "cfjfcaooomnpocpndljgpcbfabjclpnn";

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    // Set to 'new' to hide Chrome if running as part of an automated build.
    headless: false,
    slowMo: 250,
    devtools: true,
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

test("the preset URLs are visible on the Chrome extension popup", async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`);

  const list = await page.$("ul");
  const children = await list.$$("li");

  expect(children.length).toBe(2);
});

test("the two preset URLS are ", async () => {
  const workerTarget = await browser.waitForTarget(
    (target) => target.type() === "service_worker",
  );
  const worker = await workerTarget.worker();

  const value = await worker.evaluate(() => {
    chrome.storage.sync.get("blockedSites");
  });

  expect(value.length).toBe(2);
});
