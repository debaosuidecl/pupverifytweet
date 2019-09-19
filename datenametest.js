const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
let datamine;
(async () => {
  let data = await readFile('tweetlink.csv', { encoding: 'utf-8' });
  console.log(data);
})();

// console.log(file);
