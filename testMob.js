// const request = require('request-promise-native');
// const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;

// (async () => {
//   try {
//     const phoneRes = await request.get(
//       `https://mobilesms.io/webapp/api?action=number&service=twitter&country=us&key=${apiKeyMobileSMS}`
//     );

//     console.log(phoneRes);
//     let phone = JSON.parse(phoneRes).number;
//     console.log(phone);
//   } catch (error) {
//     console.error(error);
//   }
// })();

const express = require('express');
const app = express();
const UserData = require('./models/UserData');
const VerifiedUserData = require('./models/VerifiedUserData');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');

const shouldUpdateEmail = async () => {
  try {
    // const emails = await VerifiedUserData.find({})
    //   .sort({ _id: 1 })
    //   .limit(2);
    // console.log(emails);
    console.log('lets try this thing');
    connectDB();

    const myemail = new VerifiedUserData({
      email: 'Ericka23.GoldibxFIj@outlook.com',
      twitterpassword: 'ud9IsB5Sh3',
      outlookpwd: '3nSafiyj!',
      phone: 79838232
    });
    let newemail = await myemail.save();
    console.log(newemail);
    console.log('yes e don enter');
    return;
    if (emails && emails.length > 1) {
      // await myFunc(emails);
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

shouldUpdateEmail();
