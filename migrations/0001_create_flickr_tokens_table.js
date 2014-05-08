var _ = require("underscore");
var path = require("path");
var winston = require("winston");
var async = require("async");

var NodePhotoSyncUtils = require(path.resolve(__dirname, "..", "lib", "utils")).NodePhotoSyncUtils;
var PGClient = require(path.resolve(__dirname, "..", "lib", "pg-client")).PGClient;

var consoleLoggerTransport = new winston.transports.Console({
                               level: (process.env.LOG_LEVEL || "info"),
                               dumpExceptions : true,
                               showStack : true,
                               json : true,
                               colorize : true
                             });

NodePhotoSyncUtils.setLogger([ consoleLoggerTransport ]);

var client = new PGClient();

var callback = function(error, result) {
  var msg = "Migration "+__filename;
  if(error) { 
    NodePhotoSyncUtils.logger.error(msg + " failed!");
    process.exit(1);
  } else {
    NodePhotoSyncUtils.logger.info(msg+" success!");
    process.exit();
  }
};

var queryPairs = [
  ["CREATE TABLE migrations (id varchar(255))", []],
  [
    "CREATE TABLE flickr_oauth_tokens ("+
      "id serial NOT NULL, "+
      "oauth_token character(35) NOT NULL, "+
      "oauth_verifier character(17) NOT NULL"+
    ")", 
    []
  ],
  ["INSERT INTO migrations VALUES ($1)", [path.basename(__filename)]],
];

async.waterfall(
  _.map(
    queryPairs,
    function(queryPair) {
      var query = queryPair[0];
      var params = queryPair[1];
      return function() {
        var cb = arguments[arguments.length - 1];
        client.query(query, params, cb);
      }
    }
  ),
  callback
);

