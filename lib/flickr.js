var _ = require("underscore");
var URL = require("url");
var path = require("path");
var OAuth = require('oauth').OAuth;
var FormData = require("form-data");

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

Flickr.prototype.uploadUrl = function() { return UPLOAD_URL; }; 

/*

  Create form data to upload data to flickr

*/
Flickr.prototype.createForm = function(oauthToken, oauthTokenSecret, options) {
  var orderedParams = this.oauth._prepareParameters(oauthToken, oauthTokenSecret, "POST", UPLOAD_URL, options);

  var form = new FormData();

  _.each(orderedParams, function(pair, i) {
    var key = pair[0], val = pair[1];
    NodePhotoSyncUtils.logger.debug("Appending form data "+i+" - "+key+"="+val);
    form.append(key, val);
  });

  return form;
};

Flickr.prototype.accessTokenLoginUrl = function(oauthToken) {
  return AUTHORIZE_URL + "?oauth_token=" + oauthToken;
};

exports.Flickr = Flickr;