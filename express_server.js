const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


const bodyParser = require("body-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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

const checkExistingKeyVal = function(obj, key, value) {
  let existFlag = false;
  for (const item in obj) {
    if (obj[item][key] === value) {
      existFlag = true;
      break;
    }
  }
  return existFlag;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  //res.json(urlDatabase);
  let uid = req.cookies['user_id'];
  let user =  users[uid];
  const templateVars = {
    title:"URL Index",
    urls: urlDatabase,
    user,
  };
  console.log(templateVars, uid);
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let uid = req.cookies['user_id'];
  const templateVars = {
    user: users[uid]
  };
  res.render('pages/urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {

  // res.end(`${req.params}`);
  // console.log(req.params);
  let uid = req.cookies['user_id'];
  const urlVars = {
    shortURL:req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL],
    user:users[uid],
  };
  res.render('pages/urls_show', urlVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('pages/account_new', { user:undefined });
});

app.get('/login', (req, res) => {
  res.render('pages/account_login', { user:undefined });
});

// app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World!</b></body></html>")
// })


//action routes - POST
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


///User account / login / logout / register POST
app.post('/login', (req, res) => {
  let uid = req.body.user_id;
  res.cookie('user_id', uid);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  //console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  let emailExist = checkExistingKeyVal(users, "email", email);
  if (!email || !password || emailExist) {
    //res.statusCode = 400;
    res.redirect(400, '/register');
  } else {
    let uid = generateRandomString();
    users[uid] = {id: uid, email, password};
    console.log(users);
    res.cookie('user_id', uid);
    res.redirect('/urls');
  }
  
});


app.listen(PORT, () => {
  console.log(`Example app listnening on port ${PORT}`);
});