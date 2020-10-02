const { assert } = require('chai');
const { urlsForUser } = require('../helpers/urlsForUser');

const urlDatabase = {
  b6UTxQ: {longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: {longURL: "https://www.google.ca", userID: "aJ48lW" },
  r4f523: {longURL: 'https://duckduckgo.com', userID: 'userRandomID'}
};

describe('urlsForUser', function() {
  it('should return all links for a userID that has links', function() {
    let urls = urlsForUser('aJ48lW', urlDatabase);
    let expectedUrls = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    assert.deepEqual(urls, expectedUrls);
  });
  it('should return an empty object if a userID has no owned links', function() {
    let noUrls = urlsForUser('userNoUrls', urlDatabase);
    assert.deepEqual(noUrls, {});
  });
});