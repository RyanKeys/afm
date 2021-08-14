const express = require("express");
const https = require("https");
const fs = require("fs");
const CSVToJSON = require("csvtojson");
const path = require("path");

const port = 8080;

const cors = require("cors");

const app = express();
// // TURN OFF IN PRODUCTION
// const allowedOrigins = ["http://localhost:3000", "http://localhost:8080"];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg =
//           "The CORS policy for this site does not allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

app.use("/static", express.static("public"));
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "build")));

let callTime = 25;

function getFireCSV() {
  https.get(
    "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv",
    (response) => {
      const file = fs.createWriteStream("global.csv");
      response.pipe(file);
      return file;
    }
  );
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.post("/api", (req, res) => {
  // Re-caches .csv hourly.
  const currTime = new Date().getHours();
  if (currTime !== callTime) {
    callTime = new Date().getHours();
    console.log(`Caching new csv file at ${callTime}`);
    getFireCSV();
  }
  CSVToJSON()
    .fromFile("global.csv")
    .then((fires) => {
      res.json(fires);
    })
    .catch((err) => {
      console.log(err);
    });
});

https
  .createServer(
    {
      key: fs.readFileSync("./firemap_global.key"),
      cert: fs.readFileSync("./firemap_global.crt"),
    },
    app
  )
  .listen(port, function () {});
console.log(`Server started on port ${port}!`);
