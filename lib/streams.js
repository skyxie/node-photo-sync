
var _ = require("underscore");
var path = require("path");
var http = require("http");
var URL = require("url");
var FormData = require("form-data");
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
      var signedUrlStr = flickr.signedUploadUrl(oauthToken, oauthSecret, options);
      var signedUrl = URL.parse(signedUrlStr, true);

      var form = new FormData();
      _.each(signedUrl.query, function(value, key) {
        form.append(key, value);
      });

      return function(inputStream, callback) {
        form.append("photo", inputStream);
        return form.submit(signedUrlStr.replace(/\?.*$/, ''), function(error, outputStream) {
          if (error) {
            callback(error);
          }

          outputStream.resume();
          inputStream.on("end", function() {
            outputStream.end();
            callback();
          });
        });
      };
    },
    "file" : function(path, options) {
      var writeStream = fs.createWriteStream(path, options);

      return function(inputStream, callback) {
        inputStream.pipe(writeStream);
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
