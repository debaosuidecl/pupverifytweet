const express = require('express');
const VerifiedUserData = require('./models/VerifiedUserData');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');
const app = express();
const PORT = 9808;
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.listen(PORT, () => {
  connectDB();
  console.log('listening at Port ', PORT);
});

app.get('/download', function(req, res) {
  let date = new Date();

  let randomFileName = `tweetLinknew.csv`;
  try {
    res.download(randomFileName); // Set disposition and send it.
  } catch (e) {
    console.log('error');
  }
});
app.get('/downloadnew', function(req, res) {
  let q = req.query.q || 1;
  let randomFileName = `tweetNew${q}.csv`;
  try {
    res.download(randomFileName); // Set disposition and send it.
  } catch (e) {
    console.log('error');
  }
});

app.get('/deleteAll', async (req, res) => {
  try {
    await VerifiedUserData.deleteMany({});
    return res.json({
      msg: 'success'
    });
  } catch (error) {
    res.status(400).json({
      msg: 'failure',
      error
    });
  }
});

app.get('/getVerifiedAccounts', async (req, res) => {
  try {
    let users = await VerifiedUserData.find({});
    return res.json({
      users
    });
  } catch (error) {
    res.status(400).json({
      msg: 'failure',
      error
    });
  }
});
