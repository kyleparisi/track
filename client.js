const request = require("request");
const debug = require("debug")(process.env.DEBUG_NAMESPACE + ":track");
const getIdentity = require("identity");

module.exports = function(req, res) {
  if (req.path.search(/\./) !== -1) {
    return;
  }

  const start = new Date(req.start);
  const now = new Date();
  const data = {};
  data.request = {};
  data.headers = req.headers;
  data.start = start.toISOString();
  data.end = now.toISOString();
  data.delta = now - start;
  data.response = {};
  data.status = res.proxyRes.statusCode;
  data.message = res.proxyRes.statusMessage;
  data.user_id = req.user._json.sub;
  data.path = req.path;

  request(
    {
      method: "post",
      body: data,
      json: true,
      url: process.env.SERVER_URL,
      auth: {
        bearer: getIdentity().access_token
      }
    },
    function(error) {
      if (error) {
        debug(error);
      }
      debug("Hook success");
    }
  );
};
