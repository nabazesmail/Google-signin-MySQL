require('dotenv').config();

const express=require('express');
const bodyParser = require('body-parser');
const db = require("./src/models");
const cors = require('cors');

const userRoutes = require('./src/router/userRoutes');

const app=express();
app.use(cors()); // Use the cors middleware before defining routes

app.use(express.json());
app.use(bodyParser.json());

app.use('/api', userRoutes);


db.sequelize.sync().then((req) => {
    app.listen(3000, () => {
        console.log("server is running on port 3000");
    });
});