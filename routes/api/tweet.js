const express = require('express');
const router = express.Router();
const poll = require('promise-poller').default;
const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const fs = require('fs-extra');

const apiKey = '4fb64740ffa4b745aa944719725acafa';
const request = require('request-promise-native');

const { check, validationResult } = require('express-validator');

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

const prepareForTest = async page => {
  // await page.setUserAgent(USER_AGENT);
  // if (navigator.webdriver) {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });
  });
};

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis));

router.post('/', async (req, res) => {
  const { email, password, outlookpwd } = req.body;
  (async function main() {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
          `--proxy-server=p.webshare.io:80`,
          `--no-sandbox`,
          '--disable-setuid-sandbox'
        ]
      });
      const page = await browser.newPage();

      await page.authenticate({
        username: 'yvdjabhs-rotate',
        password: 'neokz9hv29hq'
      });

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
      );

      await page.goto('https://twitter.com/login');

      await page.waitFor(5000);
      await page.waitForSelector(`[name="session[username_or_email]"]`);
      await page.waitForSelector(`.js-password-field`);
      await page.type(`[type="text"]`, email);
      await page.type(`.js-password-field`, password);
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

        const page2 = await browser.newPage();
        await page2.setDefaultNavigationTimeout(90000);
        await prepareForTest(page2);
        await page2.authenticate({
          username: 'yvdjabhs-rotate',
          password: 'neokz9hv29hq'
        });

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
        await page3.authenticate({
          username: 'yvdjabhs-rotate',
          password: 'neokz9hv29hq'
        });
        await page3.goto('https://outlook.live.com/mail/inbox');
        await page3.waitFor(3000);
        await page3.waitForSelector(`[data-icon-name="MailLowImportance"]`);
        await page3.click(`[data-icon-name="MailLowImportance"]`);
        await page3.waitForSelector(`[title="verify@twitter.com"]`);
        const twitterSubjects = await page3.$$(`[title="verify@twitter.com"]`);
        const confirmationSubject = twitterSubjects[0];
        await confirmationSubject.click();
        await page3.waitForSelector(`td.x_support > strong`);
        const boldTexts = await page3.$$(`td.x_support > strong`);
        // console.log(boldTexts);
        const confirmationCodeTag = boldTexts[2];

        const confirmationCode = await page3.evaluate(
          confirmationCodeTag => confirmationCodeTag.innerText,
          confirmationCodeTag
        );

        console.log(confirmationCode);

        // go back twitter
        await page2.close();
        await page3.close();

        await page.bringToFront();

        await page.type('#challenge_response', confirmationCode);
        await confirmationChallengeBtn.click();
      } catch (error) {
        console.log('oops something went wrong with challenge then');
      }

      // try for access
      console.log('try for access');

      try {
        await page.waitForSelector(`form[action="/account/access"]`);
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
          const isCaptchaVer = await page.waitForSelector(`#recaptcha_element`);
          console.log('time for some captcha');

          const requestId = await initiateCaptchaRequest(apiKey);
          console.log('gotten the requestId');
          // solve the captcha
          // const response
          try {
            const response = await pollForRequestResults(apiKey, requestId);
            console.log(response);
            await page.evaluate(
              `document.getElementById("g-recaptcha-response").innerHTML="${response}";`
            );
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
            console.log('a captcha error must have occured');
            // probably have to close the browser
          }
        } catch (error) {
          console.log('captcha is probably not present');
        }

        console.log("let's check for phone verification");
        let phone = '';
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
          await page.type(`#phone_number`, phone);
          console.log(phone);
          console.log('typed');
          await page.click(`[value="Send code"]`);
          console.log('sending code');
        } catch (error) {
          console.log('phone number verification input is probably not there');
        }
        console.log('attempting to look for code input');
        try {
          await page.waitForSelector(`#code`);
          // enter the code
          console.log(phone, 'for code');
          await page.waitFor(60000);

          // get the code
          const smsRes = await request.get(
            `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
          );
          let sms = JSON.parse(smsRes);
          if (sms.status == -1) {
            console.error('an error occured');
            throw 'An error Occured';
          }
          if (sms.message) {
            console.error(message);
            throw 'An error Occured';
          }
          if (sms.messages && sms.messages.length == 0) {
            console.error('no sms yet');
            throw 'No SMS YET';
          }
          const verCode = sms.messages[0].message.substring(34, 40);

          await page.type('#code', verCode);
          await page.click(`[type="submit"]`);

          await page.waitFor(10000);
          await page.click(`[type="submit"]`);

          //type="submit"
        } catch (error) {
          //the email record probably should be deleted
        }
      } catch (error) {
        console.log('probably did not see access');
      }

      console.log('alirght then, time to tweet');

      // tweeting operation
      await page.mouse.click(300, 400);
      await page.waitFor(2000);
      let numberOfRuns = 100;
      let twitterLinkArray = [];
      const inputString =
        'http://volespot-enghbor.icu/8b97be79-7037-427c-9e3f-a3900b3beb21?Domain=';
      await page.waitForSelector(
        `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
      );
      const randomFileName = `tweetLink${randomstring.generate(5)}.csv`;

      await fs.writeFile(randomFileName, 'originalLink,TweetLink\n');
      let compose = await page.$(
        `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
      );
      for (let j = 0; j < numberOfRuns; j++) {
        await page.waitForSelector(
          `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
        );
        let compose = await page.$(
          `path[d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"]`
        );
        // await page.waitFor(5000);
        await compose.click();
        await page.waitFor(1000);
        await page.waitForSelector('.public-DraftStyleDefault-block');
        await page.waitFor(1000);
        let word = `${inputString}82twitter${randomstring.generate(4)}`;
        for (let i = 0; i < word.length; i++) {
          let charCode = word.charCodeAt(i);
          await page.keyboard.press(String.fromCharCode(charCode));
          if (i === word.length - 1) {
            await page.waitFor(10000);
            await page.keyboard.down('Control');
            await page.keyboard.press(String.fromCharCode(13));
            await page.keyboard.up('Control');
            // await page.waitForNavigation();
            await page.waitForSelector(`[title='${word}']`);
            console.log('tweet sent');

            let link = await page.waitForSelector(`[title='${word}']`);
            let tweetLink = await page.evaluate(link => {
              return link.getAttribute('href');
            }, link);

            console.log(tweetLink, 'seen');
            twitterLinkArray.push(tweetLink);
            await fs.appendFile(
              randomFileName,
              `"${word}","${tweetLink.substring(8, 30)}"\n`
            );

            if (j === numberOfRuns - 1) {
              console.log(twitterLinkArray);
              console.log('file saved');
              console.log('done');
              await browser.close();
              return res.json({
                msg: 'Tweets Successful',
                tweetLinks: [...twitterLinkArray]
              });
            }
            // await page.reload();
          }
        }
      }
    } catch (error) {
      console.error(error);
      // browser.close();
      res.status(500).send('Temporary Error');
    }
  })();
});

module.exports = router;
