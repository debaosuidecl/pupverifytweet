const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;
const request = require('request-promise-native');

(async () => {
  try {
    const balance = await request.get(
      `https://mobilesms.io/webapp/api?action=balance&key=${apiKeyMobileSMS}`
    );
    console.log(balance);

    // let balance = JSON.parse(phoneRes).balance;
    // console.log(balance);
  } catch (error) {
    console.log(error);
  }
})();
