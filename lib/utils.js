var _ = require("underscore");
var winston = require("winston");

NodePhotoSyncUtils = {};

// Utility function to merge 2 objects
NodePhotoSyncUtils.merge = function(obj1, obj2) {
  var mergedObj = {};
  _.each([obj1, obj2], function(obj) { _.each(obj, function(val, key) { mergedObj[key] = val; }) });
  return mergedObj;
};

NodePhotoSyncUtils.redirectUrl = function(req, redirectPath) {
  return req.protocol + "://" + req.get('host') + "/" + redirectPath;
};

NodePhotoSyncUtils.setLogger = function(transports) {
  this.logger = new winston.Logger({"transports" : transports});
};

exports.NodePhotoSyncUtils = NodePhotoSyncUtils;