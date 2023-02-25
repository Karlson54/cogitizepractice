
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require("express");
require("./database")
const bodyParser = require("body-parser");
const { router, runBackgroundFetching } = require('./routers/movie');
const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ type: "application/json" }));



app.use('/movie', router);



function errorHandler(error, req, res, next) {
  res.header("Content-Type", "application/json");
  console.log("Error occured: ", error.message);
  res.status(500).send(error.message);
}


app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  runBackgroundFetching();
});