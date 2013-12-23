var path = require("path");
var OAuth = require('oauth');

var NodePhotoSyncUtils = require(path.resolve(__dirname, "utils")).NodePhotoSyncUtils;

var Flickr = {};

Flickr.REQUEST_TOKEN_URL = "http://www.flickr.com/services/oauth/request_token";
Flickr.ACCESS_TOKEN_URL = "http://www.flickr.com/services/oauth/authorize";

Flickr.oauth = function(callbackUrl) {
  return new OAuth.OAuth(
    Flickr.REQUEST_TOKEN_URL,
    Flickr.ACCESS_TOKEN_URL,
    process.env.FLICKR_CONSUMER_KEY,
    process.env.FLICKR_CONSUMER_SECRET,
    '1.0',
    callbackUrl,
    'HMAC-SHA1'
  );
};

Flickr.getRequestToken = function(callbackUrl, callback) {
  this.oauth(callbackUrl).getOAuthRequestToken(callback);
};

Flickr.accessTokenLoginUrl = function(oauthToken) {
  return Flickr.ACCESS_TOKEN_URL + "?oauth_token=" + oauthToken;
};

exports.Flickr = Flickr;