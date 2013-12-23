var path = require("path");
var express = require("express");
var winston = require("winston");
var expressWinston = require("express-winston");

var Flickr = require(path.resolve(__dirname, "..", "lib", "flickr")).Flickr;
var NodePhotoSyncUtils = require(path.resolve(__dirname, "..", "lib", "utils")).NodePhotoSyncUtils;

var app = express();

var consoleLoggerTransport = new winston.transports.Console({
                               level: (process.env.LOG_LEVEL || "info"),
                               dumpExceptions : true,
                               showStack : true,
                               json : true,
                               colorize : true
                             });

NodePhotoSyncUtils.setLogger([ consoleLoggerTransport ]);

app.use(expressWinston.logger({transports : [ consoleLoggerTransport ]}));
app.use(expressWinston.errorLogger({transports : [ consoleLoggerTransport ]}));

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/flickr-oauth-request', function(req, res, next) {
  Flickr.getRequestToken(
    NodePhotoSyncUtils.redirectUrl(req, "flickr-oauth-callback"),
    function(error, oauthToken, oauthTokenSecret, results) {
      NodePhotoSyncUtils.logger.debug({
        "error" : error,
        "oauth_token" : oauthToken,
        "oauth_token_secret" : oauthTokenSecret,
        "results" : results
      });

      if (error) {
        next(error);
      } else {
        res.redirect(Flickr.accessTokenLoginUrl(oauthToken));
      }
    }
  );
});

app.get('/flickr-oauth-callback', function(req, res) {
  res.send("Welcome!");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  NodePhotoSyncUtils.logger.info("Listening on " + port);
});