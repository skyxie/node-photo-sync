var path = require("path");
var express = require("express");
var helpers = require('express-helpers');
var winston = require("winston");
var expressWinston = require("express-winston");
var cookieParser = require("cookie-parser");
var crypto = require('crypto');

var Flickr = require(path.resolve(__dirname, "..", "lib", "flickr")).Flickr;
var NodePhotoSyncUtils = require(path.resolve(__dirname, "..", "lib", "utils")).NodePhotoSyncUtils;
var PGClient = require(path.resolve(__dirname, "..", "lib", "pg-client")).PGClient;

var app = express();

var consoleLoggerTransport = new winston.transports.Console({
                               level: (process.env.LOG_LEVEL || "info"),
                               dumpExceptions : true,
                               showStack : true,
                               json : true,
                               colorize : true
                             });

NodePhotoSyncUtils.setLogger([ consoleLoggerTransport ]);

var pg = new PGClient();

helpers(app);
app.use(expressWinston.logger({transports : [ consoleLoggerTransport ]}));
app.use(expressWinston.errorLogger({transports : [ consoleLoggerTransport ]}));
app.use(cookieParser());

app.get('/', function(req, res) {
  res.render('index.html.ejs');
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
        res.cookie("flickr_oauth_token_secret", oauthTokenSecret, {"maxAge" : 24*60*60*1000, "httpOnly" : false});
        res.redirect(Flickr.accessTokenLoginUrl(oauthToken));
      }
    }
  );
});

app.get('/flickr-oauth-callback', function(req, res) {
  Flickr.getAccessToken(
    req.query.oauth_token,
    req.cookies.flickr_oauth_token_secret,
    req.query.oauth_verifier,
    function(error, oauth_access_token, oauth_access_token_secret, results) {
      if (error) {
        NodePhotoSyncUtils.logger.error(error);
        res.render('flickr_auth_error.html.ejs', {"error" : error});
      } else {
        var shasum = crypto.createHash('sha1');
        shasum.update((new Date()).toJSON(), 'ascii');
        shasum.update(oauth_access_token, 'ascii');
        shasum.update(oauth_access_token_secret, 'ascii');
        var hash_identifier = shasum.digest('hex');

        pg.query(
          "INSERT INTO flickr_oauth_tokens (oauth_access_token, oauth_access_token_secret, hash_identifier) VALUES ($1, $2, $3)",
          [
            oauth_access_token,
            oauth_access_token_secret,
            hash_identifier
          ],
          function(error, result) {
            if (error) {
              res.render('flickr_auth_error.html.ejs', {"error" : error});
            } else {
              var uploadUrl = Flickr.oauth().signUrl(
                Flickr.UPLOAD_URL,
                oauth_access_token,
                oauth_access_token_secret,
                "POST"
              );

              res.cookie("flickr_identifier", hash_identifier, {"maxAge" : 24*60*60*1000, "httpOnly" : false});
              res.render('flickr_auth_success.html.ejs', {
                          "flickr_identifier" : hash_identifier,
                          "upload_url" : uploadUrl,
                        });
            }
          }
        );  
      }
    }
  );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  NodePhotoSyncUtils.logger.info("Listening on " + port);
});