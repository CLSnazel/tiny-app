const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");

const generateRandomString = function() {
  let newLength = 6;
  let newString = "";
  //coinflip number or char
  for(let i = 0; i < newLength; i++ ) {
    let charNumCoin = Math.random();
    //if number pick random num between 0-9
    if (charNumCoin > .74) {
      let randomNum = Math.floor(Math.random() * 10);
      newString += randomNum.toString();
    } else {
      //else char coin flip upper/lower case
      let caseCoin = Math.random();
      //generate random unicode index offset from 0-26
      let charIndex = Math.floor(Math.random() * 27);
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
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  //res.json(urlDatabase);
  const templateVars = {
    title:"URL Index", 
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('pages/urls_new', templateVars);
});
app.post('/urls', (req, res) => {
  console.log(req.body);
  let newCode = generateRandomString();
  urlDatabase[newCode] = req.body.longURL;
  //res.send('OK');
  res.statusCode = 302;
  res.redirect(`/urls/${newCode}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let deleteID = req.params.shortURL;
  if (urlDatabase[deleteID]) {
    delete urlDatabase[deleteID];
  } else {
    //what do if it no there?
    //res.statusCode = 404;
  }
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let modID = req.params.shortURL;
  if (urlDatabase[modID]) {
    urlDatabase[modID] = req.body['new-longURL'];
  }
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username); 
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get('/urls/:shortURL', (req, res) => {

  // res.end(`${req.params}`);
  // console.log(req.params);
  const urlVars = {
    shortURL:req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL],
    username:req.cookies['username'],
  };
  res.render('pages/urls_show', urlVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>")
})
app.listen(PORT, () => {
  console.log(`Example app listnening on port ${PORT}`);
});