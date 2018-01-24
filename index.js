const debug = require("debug")(process.env.DEBUG_NAMESPACE);
global.debug = debug;
const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
AWS.config.region = process.env.AWS_REGION;
const es = require("elasticsearch").Client({
  hosts: [process.env.ES_URL],
  connectionClass: require("http-aws-es")
});

es.ping(
  {
    requestTimeout: 1000
  },
  function(error) {
    if (error) {
      throw new Error(
        "Can't ping elasticsearch service at: " + process.env.ES_URL
      );
    }
    debug(
      "Successfully pinged elasticsearch service at: %s",
      process.env.ES_URL
    );
  }
);

app.get("/status", function(req, res) {
  res.send("Ok");
});

app.post("/*", bodyParser.json(), function(req, res) {
  es.index(
    {
      index: process.env.ES_INDEX,
      type: process.env.ES_TYPE,
      body: req.body
    },
    function(error) {
      if (error) {
        debug();
        res.send(error);
      } else {
        res.send("Ok");
      }
    }
  );
});

app.listen(process.env.PORT, () =>
  debug("Server listening on %s", process.env.PORT)
);
