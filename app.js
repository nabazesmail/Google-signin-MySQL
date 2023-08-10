require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./src/models');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const userRoutes = require('./src/router/userRoutes');


const app = express();
app.use(cors());

app.use(
  session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(bodyParser.json());

// user routes
app.use('/', userRoutes);

port=process.env.PORT;
// Start the server
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
});
