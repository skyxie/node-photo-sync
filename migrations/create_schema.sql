CREATE TABLE migrations (
  id serial,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE flickr_oauth_tokens (
  id serial,
  oauth_token character(35) NOT NULL,
  oauth_verifier character(17) NOT NULL,
  hash_identifier varchar(255) UNIQUE NOT NULL
);
