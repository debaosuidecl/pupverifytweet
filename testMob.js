const request = require('request-promise-native');
const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;

(async () => {
  try {
    const phoneRes = await request.get(
      `https://mobilesms.io/webapp/api?action=number&service=twitter&country=us&key=${apiKeyMobileSMS}`
    );

    console.log(phoneRes);
    let phone = JSON.parse(phoneRes).number;
    console.log(phone);
  } catch (error) {
    console.error(error);
  }
})();
