const puppeteer = require("puppeteer");

const EXTENSION_PATH = "../chrome-extension-website-blocker";
const EXTENSION_ID = "cfjfcaooomnpocpndljgpcbfabjclpnn";

let browser;

beforeAll(async () => {
  browser = await puppeteer.launch({
    // Set to 'new' to hide Chrome if running as part of an automated build.
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterAll(async () => {
  await browser.close();
  browser = undefined;
});

describe("Basic e2e tests", () => {
  test("the preset URLs are visible on the Chrome extension popup", async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`);

    await page.waitForSelector("ul");
    const list = await page.$("ul");
    await page.waitForSelector("ul > li");
    const children = await list.$$("li");

    expect(children.length).toBe(2);
  });

  test("the preset URLS are stored in Chrome storage", async () => {
    const workerTarget = await browser.waitForTarget(
      (target) => target.type() === "service_worker"
    );

    const worker = await workerTarget.worker();

    const value = await worker.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(["blockedSites"], function (result) {
          resolve(result.blockedSites);
        });
      });
    });

    expect(value.length).toBe(2);
  });
});
