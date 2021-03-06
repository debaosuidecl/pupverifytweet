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
  1111,
  1112,
  1113,
  1114,
  1115,
  1116,
  1117,
  1118,
  1119,
  1120,
  1121,
  1122,
  1123,
  1124,
  1125
];

let shuffler = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

let PORT = 3900;

let server = app.listen(PORT, function() {
  connectDB();

  console.log(`listening to requests on port ${PORT}`);
});

let io = socket(server);
io.on('connection', socket => {
  socket.on('kill', async data => {
    try {
      await VerifiedUserData.updateMany(
        {},
        { loading: false, doNotRepeat: false, active: false }
      );
      io.sockets.emit('restartAll', 1);
      if (data === 1) return process.exit(1);
    } catch (error) {
      io.sockets.emit('errorActivity', 1);
      console.log(error, 'could not update or stop the process');
    }
  });
  socket.on('delete', async dataDeleteInfo => {
    let randomFileName = `tweetNew${dataDeleteInfo.offer}.csv`;
    if (dataDeleteInfo.command === 'delete') {
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
    // console.log(data.baseLink);
    console.log(data);

    // let emails;

    // return

    // declare a function
    await startTweet(
      data,
      io,
      puppeteer,
      proxies,
      shuffler,
      prepareForTest,
      fs
    );
  });
});

const startTweet = async (
  data,
  io,
  puppeteer,
  proxies,
  shuffler,
  prepareForTest,
  fs
) => {
  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  io.sockets.emit('tweet', data);
  const NUM_BROWSERS = 1;
  const NUM_PAGES = 1;
  try {
    let verifiedUser = await VerifiedUserData.findOne({
      email: data.email
    });
    console.log(verifiedUser);
    // verifiedUser.active = true; // set active to true
    verifiedUser.loading = true;
    verifiedUser.baseLink = data.baseLink;
    verifiedUser.offer = data.offer;
    verifiedUser.doNotRepeat = false; // take this back to the default setting
    // return;
    await verifiedUser.save();
  } catch (error) {
    let verifiedUserToChangeDoNotRepeat = await VerifiedUserData.findOne({
      email: data.email
    });
    verifiedUserToChangeDoNotRepeat.doNotRepeat = true;
    verifiedUserToChangeDoNotRepeat.save();
    console.log(error);
    console.log(
      'not changed active state ... or updated baseLink... account probably terminated'
    );
    return io.sockets.emit('deleteRecord', {
      ...data,
      message: 'Problem cannot find document'
    });
  }
  await (async () => {
    const startDate = new Date().getTime();
    const promisesBrowsers = [];
    for (let numBrowser = 0; numBrowser < NUM_BROWSERS; numBrowser++) {
      promisesBrowsers.push(
        new Promise(async resBrowser => {
          const oldProxyUrl = `http://195.154.161.11:${
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
            slowMo: 60
          });
          const promisesPages = [];
          //

          for (let numPage = 0; numPage < NUM_PAGES; numPage++) {
            promisesPages.push(
              new Promise(async resPage => {
                const { email, twitterpassword, outlookpwd, _id, phone } = data;
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
                      await page3.click(`[data-icon-name="MailLowImportance"]`);
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
                      `form[action="/account/access"]`
                    );
                    const button = await page.waitForSelector(
                      `input.Button[value="Start"]`
                    );

                    console.log(
                      'the button from access asking us for verification again.... we gotta kill it!'
                    );

                    let verifiedUserToKill = await VerifiedUserData.findOne({
                      email: data.email
                    });
                    verifiedUserToKill.failures = [
                      ...verifiedUserToKill.failures,
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail',
                      'fail'
                    ];
                    verifiedUserToKill.doNotRepeat = true;

                    verifiedUserToKill.save();
                    console.log(
                      'the account was killed for asking for access again!!!'
                    );
                  } catch (e) {
                    console.log('did not ask me to verify account again');
                  }

                  try {
                    await page.waitForSelector(
                      `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                    );
                    console.log('seen tweet button time to tweet');
                    io.sockets.emit('seenTweetButton', data);
                    try {
                      let verifiedUserToChangeActiveState = await VerifiedUserData.findOne(
                        { email: data.email }
                      );
                      verifiedUserToChangeActiveState.loading = false;
                      verifiedUserToChangeActiveState.active = true;

                      await verifiedUserToChangeActiveState.save();
                    } catch (error) {}
                  } catch (error) {
                    console.log('no tweet button cannot go further');
                  }
                  // return;
                  console.log('alirght then, time to tweet');

                  // tweeting operation
                  // await page.mouse.click(300, 400);
                  await page.waitFor(randomNumber(2000, 4000));
                  let numberOfRuns = 1000;
                  let twitterLinkArray = [];
                  let inputString = data.baseLink;
                  console.log(inputString, 'input string for ', email);
                  await page.waitForSelector(
                    `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                  );

                  let randomFileName = `tweetNew${data.offer}.csv`;
                  await fs.ensureFile(randomFileName);
                  console.log('File ensured');

                  let compose = await page.$(
                    `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                  );

                  await page.mouse.click(0.5, 0.5);
                  for (let j = 0; j < numberOfRuns; j++) {
                    if (numberOfRuns % 9 === 0) {
                      await page.waitFor(randomNumber(5000, 8000));
                    }
                    await page.waitForSelector(
                      `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                    );

                    await compose.click();
                    await page.waitFor(randomNumber(1000, 2500));
                    // return;
                    await page.waitForSelector(
                      '.public-DraftStyleDefault-block'
                    );

                    await page.waitFor(randomNumber(1000, 3000));
                    let word = `${inputString}${randomstring.generate(
                      7
                    )}${randomstring.generate(6)}`;
                    for (let i = 0; i < word.length; i++) {
                      let charCode = word.charCodeAt(i);
                      await page.keyboard.press(String.fromCharCode(charCode));
                      if (i === word.length - 1) {
                        await page.waitFor(randomNumber(6000, 10000));
                        await page.keyboard.down('Control');
                        await page.keyboard.press(String.fromCharCode(13));
                        await page.keyboard.up('Control');

                        let link = '';
                        try {
                          await page.waitForSelector(`[title='${word}']`);
                          console.log('tweet sent');
                          link = await page.waitForSelector(
                            `[title='${word}']`
                          );
                        } catch (error) {
                          console.log(error);
                          console.log(
                            'yes it has failed.. time to register the failure'
                          );
                          // return;
                          let verifiedUserToRegisterFailure = await VerifiedUserData.findOne(
                            {
                              email
                            }
                          );
                          // console.log(verifiedUserToRegisterFailure);
                          verifiedUserToRegisterFailure.failures.push('fail');
                          // return;
                          await verifiedUserToRegisterFailure.save();
                          console.log('failure registered');

                          await browser.close();
                          console.log('browser closed');
                        }
                        let tweetLink = '';
                        tweetLink = await page.evaluate(link => {
                          return link.getAttribute('href');
                        }, link);
                        try {
                          let verifiedUser = await VerifiedUserData.findOne({
                            email
                          });
                          console.log(verifiedUser);
                          verifiedUser.tweetLinks.push(tweetLink);
                          // return;
                          await verifiedUser.save();

                          console.log('saved link');
                          console.log(tweetLink, 'seen');
                        } catch (error) {
                          console.log(error);
                          console.log(
                            'failed save.. okay.. gonna continue anyway'
                          );
                        }

                        twitterLinkArray.push(tweetLink);
                        await fs.appendFile(
                          randomFileName,
                          `"${word}","${tweetLink
                            .replace('https://', '')
                            .replace('?amp=1', '')}"\n`
                        );
                        let csvData = await readFile(randomFileName, {
                          encoding: 'utf-8'
                        });
                        io.sockets.emit('tweetLinks', {
                          ...data
                        });

                        if (j === numberOfRuns - 1) {
                          console.log(twitterLinkArray);
                          console.log('file saved');
                          console.log('done');

                          await browser.close();
                        }
                        // await page.reload();
                      }
                    }
                  }
                } catch (error) {
                  console.log(error);
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
      `Time elapsed ${Math.round((new Date().getTime() - startDate) / 1000)} s`
    );
    io.sockets.emit('tweetEnd', {
      ...data
    });
    console.log('Checking whether to start again');
    try {
      let verifiedUser = await VerifiedUserData.findOne({
        email: data.email
      });
      // change active state
      verifiedUser.active = false;
      verifiedUser.loading = false;

      // return;
      await verifiedUser.save();
      if (verifiedUser.failures.length > 19) {
        await VerifiedUserData.findOneAndDelete({ email: data.email });
        return io.sockets.emit('deleteRecord', data);
      }
      if (verifiedUser.doNotRepeat) {
        console.log('stopped');
        return io.sockets.emit('tweetEnd');
      }
    } catch (error) {
      console.log(error);
    }
    console.log('start again');

    setTimeout(async () => {
      await startTweet(
        data,
        io,
        puppeteer,
        proxies,
        shuffler,
        prepareForTest,
        fs
      );
    }, 10000);
  })();
};
