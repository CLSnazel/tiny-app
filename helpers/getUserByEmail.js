const { findExistingKeyVal } = require('./findExistingKeyVal')

const getUserByEmail = function(email, database) {
  let user = findExistingKeyVal(database, 'email', email);
  return user;
};

module.exports = { getUserByEmail };
