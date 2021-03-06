
var _ = require("underscore");
var path = require("path");
var http = require("http");
var URL = require("url");
var fs = require("fs.extra");

var lib = path.resolve(__dirname, "..", "lib");
var Flickr = require(path.join(lib, "flickr")).Flickr;
var NodePhotoSyncUtils = require(path.join(lib, "utils")).NodePhotoSyncUtils;

var streamTypes = {
  "input" : {
    "url" : function(method, url, options) {
      var uri = URL.parse(url, false);

      if (typeof(callback) == "undefined") {
        callback = options;
        options = {};
      }

      options.host = uri.host;
      options.auth = uri.auth;
      options.path = uri.path;

      return function(callback) {
        var req = http.request(options, function(response) {
          callback(null, response);
        });

        req.on("error", callback);

        req.end();
      };
    },
    "file" : function(path, options) {
      var readStream = fs.createReadStream(path, options);
      return function(callback) {
        readStream.on("open", function() {
          callback(null, readStream);
        });

        readStream.on("error", callback);
      };
    }
  },
  "output" : {
    "flickrUpload" : function(consumerKey, consumerToken, oauthToken, oauthSecret, options) {
      var flickr = new Flickr(consumerKey, consumerToken);
      var form = flickr.createForm(oauthToken, oauthSecret, options);

      return function(inputStream, callback) {
        form.append("photo", inputStream);
        return form.submit(flickr.uploadUrl(), function(error, response) {
          if (error) {
            callback(error);
          } else {
            response.resume();

            var responseBody = "";
            response.on("data", function(data) {
              responseBody += data;
            });
            
            response.on("end", function() {
              NodePhotoSyncUtils.logger.info("RESPONSE: "+responseBody);
              callback();
            });
          }
        });
      };
    },
    "file" : function(path, options) {
      var writeStream = fs.createWriteStream(path, options);

      return function(inputStream, callback) {
        inputStream.pipe(writeStream);

        inputStream.on("error", callback);
        writeStream.on("error", callback);

        writeStream.on("finish", function() {
          NodePhotoSyncUtils.logger.info("pipe complete");
          callback();
        });
      };
    }
  }
};

var Stream = function(streamFlow, options) {
  // validations
  if (typeof(options) != "object") {
    throw new Error("Invalid definition for "+streamType);
  } else if (typeof(options.type) != "string") {
    throw new Error("Missing input type");
  } else if (!streamTypes[streamFlow].hasOwnProperty(options.type)) {
    throw new Error("Invalid input type "+options.type);
  } else if (typeof(options.args) != "object") {
    throw new Error("Missing input arguments");
  }

  this.args = options.args;
  NodePhotoSyncUtils.logger.debug("Set runner factory to flow:"+streamFlow+" type:"+options.type);
  this.runnerFactory = streamTypes[streamFlow][options.type];
};

Stream.prototype.runner = function() {
  NodePhotoSyncUtils.logger.info("Creating runner with arguments: "+this.args);
  return this.runnerFactory.apply(this, this.args);
};

var OutputStream = function(options) {
  Stream.call(this, "output", options);
}
_.extend(OutputStream.prototype, Stream.prototype);

var InputStream = function(options) {
  Stream.call(this, "input", options);
}
_.extend(InputStream.prototype, Stream.prototype);

exports.InputStream = InputStream;
exports.OutputStream = OutputStream;
