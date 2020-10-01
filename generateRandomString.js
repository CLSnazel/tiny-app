const generateRandomString = function() {
  let newLength = 6;
  let newString = "";
  //coinflip number or char
  for (let i = 0; i < newLength; i++) {
    let charNumCoin = Math.random();
    //if number pick random num between 0-9
    if (charNumCoin > .74) {
      let randomNum = Math.floor(Math.random() * 10);
      newString += randomNum.toString();
    } else {
      //else char coin flip upper/lower case
      let caseCoin = Math.random();
      //generate random unicode index offset from 0-26
      let charIndex = Math.floor(Math.random() * 26);
      //first letter in lowercase latin is 97
      let firstLetterCode = 97;
      if (caseCoin > .5) {
        //first letter in uppercase latin is 65
        firstLetterCode = 65;
      }
      //add uppercase. Using string from char code with index as offset
      newString += String.fromCharCode(firstLetterCode + charIndex);

    }
  }
  return newString;
};

module.exports = { generateRandomString };