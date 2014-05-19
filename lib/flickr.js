var path = require("path");
var OAuth = require('oauth').OAuth;

var NodePhotoSyncUtils = require(path.resolve(__dirname, "utils")).NodePhotoSyncUtils;

var Flickr = {};

Flickr.REQUEST_TOKEN_URL = "http://www.flickr.com/services/oauth/request_token";
Flickr.AUTHORIZE_URL = "http://www.flickr.com/services/oauth/authorize";
Flickr.ACCESS_TOKEN_URL = "https://www.flickr.com/services/oauth/access_token";
Flickr.UPLOAD_URL = "https://up.flickr.com/services/upload/";

Flickr.oauth = function(callbackUrl) {
  return new OAuth(
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

Flickr.getAccessToken = function(oauthToken, oauthTokenSecret, oauthVerifier, callback) {
  this.oauth().getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, callback);
};

Flickr.accessTokenLoginUrl = function(oauthToken) {
  return Flickr.AUTHORIZE_URL + "?oauth_token=" + oauthToken;
};

exports.Flickr = Flickr;