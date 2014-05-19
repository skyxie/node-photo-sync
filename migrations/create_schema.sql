CREATE TABLE flickr_oauth_tokens (
  id serial,
  oauth_access_token character(35) NOT NULL,
  oauth_access_token_secret character(17) NOT NULL,
  hash_identifier varchar(255) UNIQUE NOT NULL
);
