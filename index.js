const express = require('express');
// const connectDB = require("./config/db");

const app = express();

// connect database

// connectDB();
// init middleware

app.use(express.json({ extended: false }));

// define routes

app.use('/api/tweet', require('./routes/api/tweet'));

//set port
const PORT = 8080 || process.env.PORT;

app.use('/', express.static(__dirname + '/public'));

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
