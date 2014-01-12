var path = require("path");
var pg = require('pg'); 

var NodePhotoSyncUtils = require(path.resolve(__dirname, "utils")).NodePhotoSyncUtils;

PGClient = function(url) {
  this.client = new pg.Client(url || process.env.DATABASE_URL);
};

PGClient.prototype.query = function(query, callback) {
  var client = this.client;
  client.connect(function(error) {
    if (error) { 
      callback(error)
    } else {
      NodePhotoSyncUtils.logger.debug("RUNNING QUERY: " + query);
      client.query(query, function(error, result) {
        NodePhotoSyncUtils.logger.debug(result);
        callback(error, result);
      });
    }
  });
};

exports.PGClient = PGClient;