var path = require("path");
var pg = require('pg'); 

var NodePhotoSyncUtils = require(path.resolve(__dirname, "utils")).NodePhotoSyncUtils;

PGClient = function(url) {
  this.url = url || process.env.DATABASE_URL;
};

PGClient.prototype.query = function(query, params, callback) {
  NodePhotoSyncUtils.logger.debug("Connecting to: "+process.env.DATABASE_URL);
  pg.connect(this.url, function(error, client, done) {
    if (error) { 
      NodePhotoSyncUtils.logger.error("Error connecting to "+process.env.DATABASE_URL+":", error);
      callback(error);
    } else {
      NodePhotoSyncUtils.logger.debug("RUNNING QUERY: \"" + query + "\" WITH PARAMS: "+params.join(","));
      client.query(query, params, function(error, result) {
        if (error) {
          NodePhotoSyncUtils.logger.error("QUERY ERROR", error);
        } else {
          NodePhotoSyncUtils.logger.debug("QUERY SUCCESSFUL", result);
        }
        callback(error, result);
        done();
      });
    }
  });
};

exports.PGClient = PGClient;