const express = require('express');
// const connectDB = require("./config/db");

const app = express();

// connect database

// connectDB();
// init middleware

app.use(express.json({ extended: false }));

// define routes

app.use('/api/tweet', require('./routes/api/tweet'));
// app.use("/api/profile", require("./routes/api/profile"));
// app.use("/api/posts", require("./routes/api/posts"));
// app.use("/api/auth", require("./routes/api/auth"));

//set port
const PORT = 5000 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('API RUNNING');
});

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
