const request = require('request-promise-native');
let phone = '';
const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;

// delay(5000);
// Promise.delay(5000);
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// delay(3000).then(() => alert('runs after 3 seconds'));

(async () => {
  await delay(3000);
  phone = '7586326640';
  console.log('works');
  console.log('go');
  if (phone) {
    const smsRes = await request.get(
      `https://mobilesms.io/webapp/api?action=sms&number=${phone}&service=twitter&key=${apiKeyMobileSMS}`
    );
    let sms = JSON.parse(smsRes);
    console.log(sms);
  }
})();
