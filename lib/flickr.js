var _ = require("underscore");
var URL = require("url");
var path = require("path");
var OAuth = require('oauth').OAuth;

var NodePhotoSyncUtils = require(path.resolve(__dirname, "utils")).NodePhotoSyncUtils;

var REQUEST_TOKEN_URL = "http://www.flickr.com/services/oauth/request_token";
var AUTHORIZE_URL = "http://www.flickr.com/services/oauth/authorize";
var ACCESS_TOKEN_URL = "https://www.flickr.com/services/oauth/access_token";
var UPLOAD_URL = "https://up.flickr.com/services/upload/";

var Flickr = function(key, secret, callbackUrl) {
  this.oauth = new OAuth(REQUEST_TOKEN_URL, ACCESS_TOKEN_URL, key, secret, '1.0', callbackUrl, 'HMAC-SHA1');
};

Flickr.prototype.getRequestToken = function(callback) {
  this.oauth.getOAuthRequestToken(callback);
};

Flickr.prototype.getAccessToken = function(oauthToken, oauthTokenSecret, oauthVerifier, callback) {
  this.oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, callback);
};

Flickr.prototype.signedUploadUrl = function(oauthToken, oauthTokenSecret, options, callback) {
  var url = UPLOAD_URL + "?";
  if (typeof(callback) == "undefined") {
    callback = options;
  }

  if (typeof(options) == "object") {
    _.each(options, function(value, key) {
      url += value + "=" + key + "&";
    });
    url = url.substring(0, url.length-1);
  }

  return this.oauth.signUrl(url, oauthToken, oauthTokenSecret, "POST");
};

Flickr.prototype.accessTokenLoginUrl = function(oauthToken) {
  return AUTHORIZE_URL + "?oauth_token=" + oauthToken;
};

exports.Flickr = Flickr;