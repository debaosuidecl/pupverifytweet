var random_useragent = require('random-useragent');

var USER_AGENT = random_useragent.getRandom(function(ua) {
  return parseFloat(ua.browserVersion) >= 50 && ua.osName == 'Windows';
});

console.log(USER_AGENT);
