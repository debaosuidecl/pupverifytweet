const express = require('express');
const app = express();
const VerifiedUserData = require('./models/VerifiedUserData');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const fs = require('fs-extra');
const fsOriginal = require('fs');
const util = require('util');
const readFile = util.promisify(fsOriginal.readFile);
let socket = require('socket.io');

const returnRandom = () => {
  return Math.floor(Math.random() * 7000) + 3000;
};

const prepareForTest = async page => {
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
  );
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });
  });
};

function shuffle(array) {
  var i = array.length,
    j = 0,
    temp;
  while (i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const proxies = [
  9463,
  9464,
  9465,
  9466,
  9467,
  9468,
  9469,
  9470,
  9471,
  9472,
  9473,
  9474,
  9475,
  9476,
  9477
];

let shuffler = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

let PORT = 1900;

let server = app.listen(PORT, function() {
  connectDB();

  console.log(`listening to requests on port ${PORT}`);
});

let io = socket(server);
io.on('connection', socket => {
  socket.on('kill', async data => {
    if (data === 1) return process.exit(1);
  });
  socket.on('delete', async data => {
    let date = new Date();
    let randomFileName = `tweetLinknew.csv`;
    if (data === 'delete') {
      fs.unlink(randomFileName, function(err) {
        if (err) {
          io.sockets.emit('deleteError', 'File does not exist');
        } else {
          io.sockets.emit('delete', randomFileName);
          console.log('File deleted!');
        }

        // if no error, file has been deleted successfully
      });
    }
  });

  console.log('made socket connection ', socket.id);
  socket.on('tweetStart', async data => {
    console.log(data.baseLink);
    io.sockets.emit('tweet', data);
    let emails;
    try {
      emails = await VerifiedUserData.find({})
        .sort({ _id: -1 })
        .limit(13);
      console.log(emails);
    } catch (error) {
      console.log(error);
    }
    // return
    const NUM_BROWSERS = 13;
    const NUM_PAGES = 1;

    await (async () => {
      const startDate = new Date().getTime();
      const promisesBrowsers = [];
      for (let numBrowser = 0; numBrowser < NUM_BROWSERS; numBrowser++) {
        promisesBrowsers.push(
          new Promise(async resBrowser => {
            const oldProxyUrl = `http://62.210.169.25:${
              proxies[shuffler[numBrowser]]
            }`;
            console.log(proxies[shuffler[numBrowser]]);
            const browser = await puppeteer.launch({
              headless: true,
              ignoreHTTPSErrors: true,
              ignoreDefaultArgs: ['--enable-automation'],
              args: [
                `-no-sandbox`,
                '-disable-setuid-sandbox',
                `--proxy-server=${oldProxyUrl}`
              ],
              slowMo: 70
            });
            const promisesPages = [];
            //

            for (let numPage = 0; numPage < NUM_PAGES; numPage++) {
              promisesPages.push(
                new Promise(async resPage => {
                  const {
                    email,
                    twitterpassword,
                    outlookpwd,
                    _id,
                    phone
                  } = emails[numBrowser];
                  console.log(
                    email,
                    twitterpassword,
                    outlookpwd,
                    numBrowser,
                    phone,
                    _id
                  );
                  try {
                    const page = await browser.newPage();

                    // await page.goto('http://lumtest.com/myip.json');
                    // return;
                    await prepareForTest(page);
                    await page.setDefaultNavigationTimeout(0);
                    await page.goto('https://twitter.com/login');

                    await page.waitFor(5000);
                    await page.waitForSelector(
                      `[name="session[username_or_email]"]`
                    );
                    await page.waitForSelector(`.js-password-field`);
                    await page.type(`[type="text"]`, email);
                    await page.type(`.js-password-field`, twitterpassword);
                    await page.waitFor(2000);
                    await page.waitForSelector(`button[type="submit"]`);
                    await page.click(`button[type="submit"]`);

                    // await page.waitForNavigation();
                    console.log('logged in');
                    // return;
                    // try for confirmation
                    await page.setDefaultNavigationTimeout(30000);
                    try {
                      const AgreeForConsent = await page.waitForSelector(
                        `[data-testid="OCF_CallToAction_Button"]`
                      );
                      await AgreeForConsent.click();
                    } catch (error) {
                      console.log(error);
                      console.log('agree consent probably not there');
                    }

                    try {
                      await page.waitFor(4000);
                      const buttons = await page.waitForSelector(
                        '.css-18t94o4[role="button"]'
                      );
                      await page.keyboard.down('Shift');
                      await page.waitFor(6000);
                      await page.keyboard.press(String.fromCharCode(13));
                      await page.keyboard.press(String.fromCharCode(13));
                      await page.keyboard.up('Shift');
                      await page.keyboard.press(String.fromCharCode(13));
                    } catch (error) {
                      console.log(error);
                    }
                    try {
                      let retypePhoneIndicator = await page.waitForSelector(
                        `input[value="RetypePhoneNumber"]`
                      );
                      await page.waitForSelector(`[name="challenge_response"]`);
                      await page.type(`[name="challenge_response"]`, phone);
                      // await page.type(`[name="challenge_response"]`, phone );
                      await page.click(`[type="submit"]`);
                      // await page.type('#challenge_response', phone);
                    } catch (e) {
                      console.log(e, 'no phone number to retype');
                    }

                    try {
                      let confirmationChallengeBtn = await page.waitForSelector(
                        `input[value="TemporaryPassword"]`
                      );
                      console.log(confirmationChallengeBtn, 'the confirmation');

                      const page2 = await browser.newPage();
                      await page2.setDefaultNavigationTimeout(90000);
                      await prepareForTest(page2);

                      // sign in to outlook algorithm
                      await page2.goto(`https://login.live.com/`);
                      await page2.waitForSelector(`[type="email"]`);
                      await page2.type(`[type="email"]`, email);
                      await page2.click(`[type="submit"]`);
                      await page2.waitForSelector(`[type="password"]`);
                      await page2.waitFor(2000);
                      await page2.type(`[type="password"]`, outlookpwd);
                      await page2.click(`[type="submit"]`);
                      await page2.waitForNavigation();
                      let page3 = await browser.newPage();
                      await prepareForTest(page3);
                      await page3.goto('https://outlook.live.com/mail/inbox');
                      await page3.waitFor(3000);
                      try {
                        await page3.waitForSelector(
                          `[title="verify@twitter.com"]`
                        );
                        const twitterSubjects = await page3.$$(
                          `[title="verify@twitter.com"]`
                        );
                        const confirmationSubject = twitterSubjects[0];
                        await confirmationSubject.click();

                        await page3.waitForSelector(`td.x_support > strong`);
                        let boldTexts = await page3.$$(`td.x_support > strong`);
                        console.log(boldTexts);
                        let confirmationCodeTag = boldTexts[2];

                        confirmationCode = await page3.evaluate(
                          confirmationCodeTag => confirmationCodeTag.innerText,
                          confirmationCodeTag
                        );
                        console.log(confirmationCode);
                      } catch (error) {
                        console.log(error);
                        console.log('not in focused');
                        await page3.waitForSelector(
                          `[data-icon-name="MailLowImportance"]`
                        );
                        await page3.click(
                          `[data-icon-name="MailLowImportance"]`
                        );
                        await page3.waitForSelector(
                          `[title="verify@twitter.com"]`
                        );
                        const twitterSubjects = await page3.$$(
                          `[title="verify@twitter.com"]`
                        );
                        const confirmationSubject = twitterSubjects[0];
                        await confirmationSubject.click();
                        await confirmationSubject.click();

                        await page3.waitForSelector(`td.x_support > strong`);
                        let boldTexts = await page3.$$(`td.x_support > strong`);
                        console.log(boldTexts);
                        let confirmationCodeTag = boldTexts[2];

                        confirmationCode = await page3.evaluate(
                          confirmationCodeTag => confirmationCodeTag.innerText,
                          confirmationCodeTag
                        );
                        console.log(confirmationCode);
                      }

                      // go back twitter
                      await page2.close();
                      await page3.close();

                      await page.bringToFront();

                      await page.type('#challenge_response', confirmationCode);
                      await confirmationChallengeBtn.click();
                    } catch (error) {
                      console.log(
                        'oops something went wrong with challenge then'
                      );
                      console.log(error);
                    }

                    // try for already verified

                    try {
                      await page.waitForSelector(
                        `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                      );
                      console.log('seen tweet button time to tweet');
                      io.sockets.emit('seenTweetButton', 1);
                    } catch (error) {
                      console.log('no tweet button cannot go further');
                    }
                    // return;
                    console.log('alirght then, time to tweet');

                    // tweeting operation
                    // await page.mouse.click(300, 400);
                    await page.waitFor(2000);
                    let numberOfRuns = 1000;
                    let twitterLinkArray = [];
                    const inputString = data.baseLink;
                    await page.waitForSelector(
                      `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                    );
                    // const randomFileName = `tweetLink.csv`;

                    let date = new Date();
                    let randomFileName = `tweetLinknew.csv`;
                    await fs.ensureFile(randomFileName);
                    console.log('File ensured');

                    let compose = await page.$(
                      `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                    );
                    // compose.click();
                    // await page.click(0.5, 0.5);
                    await page.mouse.click(0.5, 0.5);
                    for (let j = 0; j < numberOfRuns; j++) {
                      await page.waitForSelector(
                        `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                      );

                      // await page.waitFor(5000);
                      await compose.click();
                      // await page.goto(`https://twitter.com/compose/tweet`);
                      // await page.bringToFront();
                      await page.waitFor(1000);
                      await page.waitForSelector(
                        '.public-DraftStyleDefault-block'
                      );
                      await page.waitFor(1000);
                      let word = `${inputString}${randomstring.generate(
                        9
                      )}${randomstring.generate(6)}`;
                      for (let i = 0; i < word.length; i++) {
                        let charCode = word.charCodeAt(i);
                        await page.keyboard.press(
                          String.fromCharCode(charCode)
                        );
                        if (i === word.length - 1) {
                          await page.waitFor(8000);
                          await page.keyboard.down('Control');
                          await page.keyboard.press(String.fromCharCode(13));
                          await page.keyboard.up('Control');
                          // await page.waitForNavigation();
                          await page.waitForSelector(`[title='${word}']`);
                          console.log('tweet sent');
                          let link = '';
                          try {
                            link = await page.waitForSelector(
                              `[title='${word}']`
                            );
                          } catch (e) {
                            console.log(e);
                            io.sockets.emit('instanceError', 1);
                          }
                          let tweetLink = '';
                          try {
                            tweetLink = await page.evaluate(link => {
                              return link.getAttribute('href');
                            }, link);
                          } catch (error) {
                            console.log(error, 'not seen link');
                            io.sockets.emit('instanceError', 1);
                          }

                          console.log(tweetLink, 'seen');
                          twitterLinkArray.push(tweetLink);
                          await fs.appendFile(
                            randomFileName,
                            `"${word}","${tweetLink.substring(8, 30)}"\n`
                          );
                          let csvData = await readFile(randomFileName, {
                            encoding: 'utf-8'
                          });
                          io.sockets.emit('tweetLinks', {
                            tweetLink: `${tweetLink
                              .replace('https://', '')
                              .replace('?amp=1', '')}`,
                            csvData
                          });

                          if (j === numberOfRuns - 1) {
                            console.log(twitterLinkArray);
                            console.log('file saved');
                            console.log('done');
                            io.sockets.emit('instanceError', 1);

                            await browser.close();
                          }
                          // await page.reload();
                        }
                      }
                    }
                  } catch (error) {
                    console.log(error);
                    io.sockets.emit('instanceError', 1);
                  }
                  resPage();
                })
              );
            }
            await Promise.all(promisesPages);
            await browser.close();

            resBrowser();
          })
        );
      }

      await Promise.all(promisesBrowsers);
      console.log(
        `Time elapsed ${Math.round(
          (new Date().getTime() - startDate) / 1000
        )} s`
      );
      io.sockets.emit('tweetEnd', {
        timeElapsed: Math.round((new Date().getTime() - startDate) / 1000)
      });
    })();
  });
});
