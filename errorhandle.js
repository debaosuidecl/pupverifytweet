const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto('https://www.google.com');

  try {
    await page.waitForSelector('.blah');
    await page.setDefaultNavigationTimeout(60000);
    console.log('seen selector');
  } catch (e) {
    console.log('not seen selector');
  }
  await page.goto('https://www.facebook.com');
  console.log('gone to yahoo');
})();
