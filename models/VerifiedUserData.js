// THIS IS THE USER SCHEMA FILE

const mongoose = require('mongoose');

const VerifiedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  twitterpassword: {
    type: String,
    required: true
    // unique: true
  },
  tweetLinks: {
    type: [String]
  },
  outlookpwd: {
    type: String,
    required: true
  },
  phone: {
    type: String
    // required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  doNotRepeat: {
    type: Boolean,
    default: false
  },
  baseLink: {
    type: String
  }
});

module.exports = VerifiedUserData = mongoose.model(
  'verifieduserdataPuppeteer',
  VerifiedUserSchema
); // takes in model name and schema
