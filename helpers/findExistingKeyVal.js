
//given an object, key and value
//return the nested object where the given key equates to hte given value
//else return undefined
const findExistingKeyVal = function(obj, key, value) {
  //let existFlag = false;
  let matchingObj = undefined;
  for (const item in obj) {
    if (obj[item][key] === value) {
      //existFlag = true;
      matchingObj = obj[item];
      break;
    }
  }
  //return existFlag;
  return matchingObj;
};

module.exports = { findExistingKeyVal };