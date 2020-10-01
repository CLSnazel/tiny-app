const { findExistingKeyVal } = require('./findExistingKeyVal');
//filter URLS
//given a user id as string, return an object of urls that have a matching userID value
const urlsForUser = function(uid, urlDatabase) {
  let filteredObj = {};
  for (let url in urlDatabase) {
    let matchingObj = findExistingKeyVal({url:urlDatabase[url]}, "userID", uid);
    if (matchingObj) {
      filteredObj[url] = matchingObj;
    }
  }
  return filteredObj;
}

module.exports = { urlsForUser };