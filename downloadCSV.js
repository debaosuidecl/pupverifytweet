const express = require('express');

const app = express();
const PORT = 9808;
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://167.99.124.182:8080'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.listen(PORT, () => {
  console.log('listening at Port ', PORT);
});

app.get('/download', function(req, res) {
  let date = new Date();
  // let randomFileName = `tweetLink${date.getDay()}${date.getMonth()}${date.getFullYear()}.csv`;
  let randomFileName = `tweetLinknew.csv`;
  try {
    res.download(randomFileName); // Set disposition and send it.
  } catch (e) {
    console.log('error');
  }
});
