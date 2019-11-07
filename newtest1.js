const express = require('express');
const app = express();
const UserData = require('./models/UserData');
const VerifiedUserData = require('./models/VerifiedUserData');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');

var random_useragent = require('random-useragent');

// const router = express.Router();
const poll = require('promise-poller').default;
const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const fs = require('fs-extra');

const apiKey = '4fb64740ffa4b745aa944719725acafa';
const request = require('request-promise-native');
var USER_AGENT = random_useragent.getRandom(function(ua) {
  return parseFloat(ua.browserVersion) >= 50 && ua.osName == 'Windows';
});
console.log(USER_AGENT, 'USER');

const returnRandom = () => {
  return Math.floor(Math.random() * 7000) + 3000;
};

const prepareForTest = async page => {
  // await page.authenticate({
  //   username: 'yvdjabhs-rotate',
  //   password: 'neokz9hv29hq'
  // });

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

// const pluginProxy = require('puppeteer-extra-plugin-proxy');
// add proxy plugin without proxy crendentials

const proxies = [9463, 9464, 9465, 9466, 9467, 9468, 9469, 9470, 9471, 9472];

// get randomized indexes with shuffle

let shuffler = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const siteDetails = {
  // sitekey: '6LdjXQkTAAAAADFGRY5gVKtvhGvh8B2eF3oc-Y4E',
  sitekey: '6Lc5hC4UAAAAAEx-pIfqjpmg-_-1dLnDwIZ8RToe',
  pageurl: 'https://twitter.com/account/access'
};

async function initiateCaptchaRequest(apiKey) {
  const formData = {
    method: 'userrecaptcha',
    googlekey: siteDetails.sitekey,
    key: apiKey,
    pageurl: siteDetails.pageurl,
    json: 1
  };
  const response = await request.post('http://2captcha.com/in.php', {
    form: formData
  });
  return JSON.parse(response).request;
}

async function pollForRequestResults(
  key,
  id,
  retries = 30,
  interval = 1500,
  delay = 15000
) {
  await timeout(delay);
  return poll({
    taskFn: requestCaptchaResults(key, id),
    interval,
    retries
  });
}

function requestCaptchaResults(apiKey, requestId) {
  const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
  return async function() {
    return new Promise(async function(resolve, reject) {
      const rawResponse = await request.get(url);
      const resp = JSON.parse(rawResponse);
      if (resp.status === 0) return reject(resp.request);
      resolve(resp.request);
    });
  };
}

// const prepareForTest = async page => {
//   await page.evaluateOnNewDocument(() => {
//     Object.defineProperty(navigator, 'webdriver', {
//       get: () => false
//     });
//   });
// };

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis));

const myFunc = async emails => {
  // const {} = emails
  const NUM_BROWSERS = emails.length;
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
              // `--proxy-server=p.webshare.io:80`
            ],
            slowMo: 70
          });
          const promisesPages = [];

          for (let numPage = 0; numPage < NUM_PAGES; numPage++) {
            promisesPages.push(
              new Promise(async resPage => {
                const { email, twitterpassword, outlookpwd, _id } = emails[
                  numBrowser
                ];
                console.log(
                  email,
                  twitterpassword,
                  outlookpwd,
                  numBrowser,
                  _id
                );
                let save = false;
                let phone = '';
                try {
                  const page = await browser.newPage();
                  await page.setDefaultNavigationTimeout(60000);
                  // await page.goto('http://lumtest.com/myip.json');
                  // return;
                  await prepareForTest(page);
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

                  try {
                    let confirmationChallengeBtn = await page.waitForSelector(
                      `#email_challenge_submit`
                    );
                    console.log(confirmationChallengeBtn, 'the confirmation');
                    // return;
                    const page2 = await browser.newPage();
                    await page2.setDefaultNavigationTimeout(90000);
                    await prepareForTest(page2);
                    // await page2.authenticate({
                    //   username: 'yvdjabhs-rotate',
                    //   password: 'neokz9hv29hq'
                    // });

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
                    // await page3.authenticate({
                    //   username: 'yvdjabhs-rotate',
                    //   password: 'neokz9hv29hq'
                    // });
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
                  // console.log('try for already verified');

                  try {
                    console.log('try for consent');
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
                    console.log('check for continue to twitter');
                    await page.waitForSelector(`[value="Continue to Twitter"]`);
                    await page.click(`[value="Continue to Twitter"]`);
                  } catch (error) {
                    console.log('continue to twitter not there');
                  }
                  try {
                    console.log(
                      'check for tweet button for logged in phone number addition'
                    );
                    await page.waitForSelector(
                      `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
                    );
                    console.log('seen tweet button');

                    await page.waitForSelector(
                      `path[d="M16.5 10.25c-.965 0-1.75.787-1.75 1.75s.784 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.786-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.966 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75 1.75-.786 1.75-1.75-.784-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.965 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.787-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75z"]`
                    );
                    console.log('seen settings');
                    await page.click(`[
                      d =
                        'M16.5 10.25c-.965 0-1.75.787-1.75 1.75s.784 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.786-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.966 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75 1.75-.786 1.75-1.75-.784-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.965 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.787-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75z'
                    ]`);

                    console.log('clicked settings');

                    await page.waitForSelector(
                      `[d="M12 8.21c-2.09 0-3.79 1.7-3.79 3.79s1.7 3.79 3.79 3.79 3.79-1.7 3.79-3.79-1.7-3.79-3.79-3.79zm0 6.08c-1.262 0-2.29-1.026-2.29-2.29S10.74 9.71 12 9.71s2.29 1.026 2.29 2.29-1.028 2.29-2.29 2.29z"]`
                    );

                    await page.click(
                      `[d="M12 8.21c-2.09 0-3.79 1.7-3.79 3.79s1.7 3.79 3.79 3.79 3.79-1.7 3.79-3.79-1.7-3.79-3.79-3.79zm0 6.08c-1.262 0-2.29-1.026-2.29-2.29S10.74 9.71 12 9.71s2.29 1.026 2.29 2.29-1.028 2.29-2.29 2.29z"]`
                    );
                    console.log('clicked actual settings');

                    await page.waitForSelector(`[href="/settings/account"]`);
                    await page.click(`[href="/settings/account"]`);
                    console.log('clicked on account');
                    await page.waitForSelector(`[href="/settings/phone"]`);
                    await page.click(`[href="/settings/phone"]`);
                    console.log('clicked on phone');
                    await page.waitForSelector(`[href="/i/flow/add_phone"]`);
                    await page.click(`[href="/i/flow/add_phone"]`);
                    console.log('clicked on add phone');

                    await page.waitForSelector(`[name="password"]`);
                    await page.type(`[name="password"]`, twitterpassword);
                    console.log('typed');
                    await page.waitForSelector(`[role="button"]`);
                    const possibleNext = await page.$$(`[role="button"]`);
                    // const myNext = possibleNext[0];
                    await possibleNext[0].click();
                    console.log('clicked on next');

                    await page.waitForSelector(`[name="phone_number"]`);

                    console.log('start_phone_verification');
                    // return;
                    await page.select('[aria-label="Country code"]', 'GB');
                    const phoneRes = await request.get(
                      `https://mobilesms.io/webapp/api?action=number&service=twitter&country=uk&key=${apiKeyMobileSMS}`
                    );
                    console.log(phoneRes);

                    let phone = JSON.parse(phoneRes).number;
                    if (!phone) {
                      console.log('no phone number received');
                    }
                    await page.type(`[name="phone_number"]`, phone);

                    await page.waitForSelector(`[role="button"]`);
                    const possibleNext2 = await page.$$(`[role="button"]`);
                    // const myNext = possibleNext[0];
                    await page.waitFor(10000);
                    await possibleNext2[0].click();
                    console.log('clicked on next');

                    await page.waitForSelector(
                      `[data-testid="confirmationSheetConfirm"]`
                    );
                    await page.click(
                      `[data-testid="confirmationSheetConfirm"]`
                    );

                    // await page.click()

                    try {
                      console.log('try and wait for verification code');
                      await page.waitForSelector(`[name="verfication_code"]`);
                      await page.waitFor(60000);
                      console.log(phone, 'for code');
                      await page.waitFor(100000);

                      // get the code
                      const smsRes = await request.get(
                        `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
                      );
                      let sms = JSON.parse(smsRes);
                      console.log(sms);
                      if (sms.status == -1) {
                        console.error('an error occured');
                        // throw 'An error Occured';
                      }
                      if (sms.message) {
                        console.error(message);
                        // throw 'An error Occured';
                      }
                      if (sms.messages && sms.messages.length == 0) {
                        console.error('no sms yet');
                        // throw 'No SMS YET';
                      }
                      const verCode = sms.messages[0].message.substring(34, 40);

                      await page.type('[name="verfication_code"]', verCode);
                      // await page.click(`[type="submit"]`);
                      await page.waitFor(`[role="button"]`);
                      const possibleNext = await page.$$(`[role="button"]`);
                      await possibleNext[1].click();
                      console.log('please save now');
                      await page.waitFor(10000);
                      let verifiedUser = new VerifiedUserData({
                        email,
                        twitterpassword,
                        outlookpwd,
                        phone
                      });
                      const newUser = await verifiedUser.save();
                      console.log(newUser, 'data saved');

                      await UserData.findOneAndRemove({ _id: _id });
                      // await page.click(`[type="submit"]`);

                      //type="submit"
                    } catch (error) {
                      //the email record probably should be deleted
                      console.log(
                        'trying one more time and waiting for 60000 for message'
                      );
                      await page.waitFor(80000);

                      // get the code
                      const smsRes = await request.get(
                        `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
                      );
                      let sms = JSON.parse(smsRes);
                      console.log(sms);
                      if (sms.status == -1) {
                        console.error('an error occured');
                        // throw 'An error Occured';
                      }
                      if (sms.message) {
                        console.error(message);
                        // throw 'An error Occured';
                      }
                      if (sms.messages && sms.messages.length == 0) {
                        console.error('no sms yet');
                        // throw 'No SMS YET';
                      }
                      const verCode = sms.messages[0].message.substring(34, 40);
                      await page.type('[name="verfication_code"]', verCode);
                      // await page.click(`[type="submit"]`);
                      await page.waitFor(`[role="button"]`);
                      const possibleNext = await page.$$(`[role="button"]`);
                      await possibleNext[1].click();
                      console.log('please save now');
                      await page.waitFor(10000);
                      let verifiedUser = new VerifiedUserData({
                        email,
                        twitterpassword,
                        outlookpwd,
                        phone
                      });
                      const newUser = await verifiedUser.save();
                      console.log(newUser, 'data saved');

                      await UserData.findOneAndRemove({ _id: _id });
                    }

                    //role="button"
                    console.log(
                      'seen tweet button, slight issue we have to transfer this record back'
                    );

                    console.log(newUser, ' is deleted');
                  } catch (error) {
                    try {
                      await page.waitForSelector(`#tweet-box-home-timeline`);
                      console.log('checking for annoying opening');
                      await UserData.findOneAndRemove({ _id: _id });
                      console.log(newUser, ' is deleted');
                    } catch (error) {
                      console.log('annoying opening not there');
                    }

                    console.log('no tweet button move along');
                  }
                  // try for access
                  console.log('try for access');

                  try {
                    await page.waitForSelector(
                      `form[action="/account/access"]`
                    );
                    console.log('go for it from second block');

                    try {
                      const button = await page.waitForSelector(
                        `input.Button[value="Start"]`
                      );
                      console.log(button);
                      console.log('button Captcha');
                      console.log(button);
                      // return;
                      // if (button) {
                      await page.click(`[type="submit"]`);
                      // }
                    } catch (error) {
                      console.log("probably didn't see the start button");
                    }

                    console.log("let's try and see if captcha's there");
                    try {
                      const isCaptchaVer = await page.waitForSelector(
                        `#recaptcha_element`
                      );
                      console.log('time for some captcha');

                      const requestId = await initiateCaptchaRequest(apiKey);
                      console.log('gotten the requestId');
                      // solve the captcha
                      // const response
                      try {
                        const response = await pollForRequestResults(
                          apiKey,
                          requestId
                        );
                        console.log(response);
                        // await page.evaluate(
                        //   `document.getElementById("g-recaptcha-response").innerHTML="${response}";`
                        // );
                        await page.evaluate(
                          `document.querySelector("[value='Continue']").style.display = "block"`
                        );
                        await page.evaluate(
                          `document.querySelector("#verification_string").style.display = "block"`
                        );
                        await page.evaluate(
                          `document.querySelector("#verification_string").value = "${response}"`
                        );
                        //
                        await page.click(`[value="Continue"]`);
                      } catch (error) {
                        console.log(error);
                        console.log(
                          'a captcha error must have occured. attempting to try again'
                        );
                        const response = await pollForRequestResults(
                          apiKey,
                          requestId
                        );
                        console.log(response);
                        // await page.evaluate(
                        //   `document.getElementById("g-recaptcha-response").innerHTML="${response}";`
                        // );
                        await page.evaluate(
                          `document.querySelector("[value='Continue']").style.display = "block"`
                        );
                        await page.evaluate(
                          `document.querySelector("#verification_string").style.display = "block"`
                        );
                        await page.evaluate(
                          `document.querySelector("#verification_string").value = "${response}"`
                        );
                        //
                        await page.click(`[value="Continue"]`);
                        // probably have to close the browser
                      }
                    } catch (error) {
                      console.log('captcha is probably not present');
                    }

                    console.log("let's check for phone verification");
                    // let phone = '';
                    try {
                      await page.waitForSelector(`#phone_number`);

                      console.log('start_phone_verification');
                      await page.select('#country_code', '44');
                      const phoneRes = await request.get(
                        `https://mobilesms.io/webapp/api?action=number&service=twitter&country=uk&key=${apiKeyMobileSMS}`
                      );
                      console.log(phoneRes);

                      phone = JSON.parse(phoneRes).number;
                      if (!phone) {
                        console.log('no phone number received');
                      }
                      // save phone in database may not be an option, since it is temporary.
                      const myemail = new VerifiedUserData({
                        email: email,
                        twitterpassword: twitterpassword,
                        outlookpwd: outlookpwd,
                        phone: phone
                      });
                      let newemail = await myemail.save();
                      console.log(newemail);
                      console.log('yes e don enter');
                      console.log('you have no excuse please');
                      console.log('I beg of you do this for me');
                      await UserData.findOneAndRemove({ _id: _id });
                      console.log(newemail, ' is deleted');

                      await page.type(`#phone_number`, phone);
                      console.log(phone);
                      console.log('typed');
                      await page.click(`[value="Send code"]`);
                      console.log('sending code');
                    } catch (error) {
                      console.log(
                        'phone number verification input is probably not there'
                      );
                    }
                    console.log('attempting to look for code input');
                    try {
                      await page.waitForSelector(`#code`);
                      // enter the code
                      console.log(phone, 'for code');
                      await page.waitFor(110000);

                      // get the code
                      const smsRes = await request.get(
                        `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
                      );
                      let sms = JSON.parse(smsRes);
                      console.log(sms);
                      if (sms.status == -1) {
                        console.error('an error occured');
                        // throw 'An error Occured';
                      }
                      if (sms.message) {
                        console.error(message);
                        // throw 'An error Occured';
                      }
                      if (sms.messages && sms.messages.length == 0) {
                        console.error('no sms yet');
                        // throw 'No SMS YET';
                      }
                      const verCode = sms.messages[0].message.substring(34, 40);

                      await page.type('#code', verCode);
                      await page.click(`[type="submit"]`);

                      await page.waitFor(10000);
                      await page.click(`[type="submit"]`);

                      //type="submit"
                    } catch (error) {
                      //the email record probably should be deleted
                      console.log(
                        'trying one more time and waiting for 60000 for message'
                      );
                      await page.waitFor(60000);

                      // get the code
                      const smsRes = await request.get(
                        `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
                      );
                      let sms = JSON.parse(smsRes);
                      console.log(sms);
                      if (sms.status == -1) {
                        console.error('an error occured');
                        // throw 'An error Occured';
                      }
                      if (sms.message) {
                        console.error(message);
                        // throw 'An error Occured';
                      }
                      if (sms.messages && sms.messages.length == 0) {
                        console.error('no sms yet');
                        // throw 'No SMS YET';
                      }
                      const verCode = sms.messages[0].message.substring(34, 40);

                      await page.type('#code', verCode);
                      await page.click(`[type="submit"]`);

                      await page.waitFor(10000);
                      await page.click(`[type="submit"]`);
                      console.log('saving user to verified collection');
                      // connectDB();

                      await page.waitFor(20000);
                    }
                  } catch (error) {
                    console.log('probably did not see access');
                  }

                  /// trying stuff
                } catch (err) {
                  console.log(err);
                  // clearTimeout(t);
                  console.log('timeout has been cleared');
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
    process.exit(1);
  })();
};

const shouldUpdateEmail = async () => {
  try {
    const balance = await request.get(
      `https://mobilesms.io/webapp/api?action=balance&key=${apiKeyMobileSMS}`
    );
    console.log(balance);
    if (balance <= 3) {
      return setTimeout(shouldUpdateEmail, 80000);
      // return shouldUpdateEmail();
    }
    const emails = await UserData.find({})
      .sort({ _id: 1 })
      .limit(2);
    // console.log(emails);
    const verifiedEmailsCount = await VerifiedUserData.countDocuments();
    console.log('verified emails count is ', verifiedEmailsCount);

    if (verifiedEmailsCount < 10) {
      await myFunc(emails);
    } else {
      console.log('nothing to verify');
    }
    // console.log(emailLength, 'this is the email length');
    // return;

    setTimeout(shouldUpdateEmail, 80000);
    // console.log(response);
    //
  } catch (error) {
    console.log(error);
    console.log('error');
    setTimeout(shouldUpdateEmail, 10000);
  }
};

let PORT = process.env.PORT || 7000;
connectDB();
app.listen(PORT, () => {
  console.log('listening on PORT ', PORT);

  setTimeout(shouldUpdateEmail, 10000);
});
