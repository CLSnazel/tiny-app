const express = require('express');
const morgan = require('morgan');
//const cookieParser = require('cookie-parser');
const { findExistingKeyVal } = require('./findExistingKeyVal');
const { generateRandomString } = require('./generateRandomString');
const { urlsForUser } = require('./urlsForUser');
const { getUserByEmail } = require('./getUserByEmail');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');


const bodyParser = require("body-parser");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  r4f523: { longURL: 'https://duckduckgo.com', userID: 'userRandomID'}
};


//preset users for testing
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//hashing preset users passwords from plain-text
users["aJ48lW"].password = bcrypt.hashSync(users["aJ48lW"].password, 10);
users["userRandomID"].password = bcrypt.hashSync(users["userRandomID"].password, 10);

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name:'session',
  keys: ['catzR@m@z!ngi<3th3m'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(morgan('dev'));


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  //res.send('Hello!');
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  //res.json(urlDatabase);
  let uid = req.session['user_id'];
  let user = users[uid];
  // if (user) {
  // }
  let userURLS = urlsForUser(uid, urlDatabase);
  const templateVars = {
    title:"URL Index",
    urls: userURLS,
    user,
  };
  console.log(templateVars, uid);
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let uid = req.session['user_id'];
  let user = users[uid]
  if (user) {
    const templateVars = {
      user 
    };
    res.render('pages/urls_new', templateVars);
  } else {
    res.redirect(401, "/login");
  }
});

app.get('/urls/:shortURL', (req, res) => {

  // res.end(`${req.params}`);
  // console.log(req.params);
  let uid = req.session['user_id'];
  let {shortURL} = req.params
  let urlData = urlDatabase[shortURL];

  if (!uid) {
    //not logged in
    res.render('pages/urls_show', {user:undefined, shortURL, longURL:'/urls'});
  } else if (!urlData) {
    //invalid shortURL id
    res.render('pages/urls_show', {user:users[uid], shortURL:undefined, longURL:undefined});
  } else if (urlData.userID !== uid) {
    //invalid access
    res.render('pages/urls_show', {user:users[uid], shortURL, longURL:undefined})
  } else {
    const urlVars = {
      shortURL:shortURL,
      longURL:urlData.longURL,
      user:users[uid],
    };
    res.render('pages/urls_show', urlVars);
  }

});

app.get('/u/:shortURL', (req, res) => {
  let {shortURL} = req.params
  const link = urlDatabase[shortURL];
  res.redirect(link.longURL);
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
  let uid = req.session['user_id'];
  if (uid) {
    // console.log(req.body);
    let newCode = generateRandomString();
    let { longURL } = req.body
    urlDatabase[newCode] = {
      longURL,
      userID: uid,
    };
    res.statusCode = 302;
    res.redirect(`/urls/${newCode}`);
  } else {
    res.redirect(401, '/login');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let uid = req.session['user_id'];
  if (uid) {
    let deleteID = req.params.shortURL;
    if (urlDatabase[deleteID]) {
      delete urlDatabase[deleteID];
    } else {
      //what do if it no there?
      //res.statusCode = 404;
    }
    res.redirect('/urls');
  } else {
    res.redirect(401, '/login');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  let uid = req.session['user_id'];
  if (uid) {
    let modID = req.params.shortURL;
    let longURL = req.body['new-longURL']
    if (urlDatabase[modID]) {
      urlDatabase[modID] = {longURL, userID:uid};
    }
    res.redirect('/urls');
  } else {
    res.redirect(401, '/login');
  }
});


///User account / login / logout / register POST
app.post('/login', (req, res) => {
  //let uid = req.body.user_id;
  let {email, password} = req.body;
  //check password and email are not empty
  if (!email || !password) {
    res.redirect(403, '/login');
  } else {
    //check that email is in users, and password matches entry
    let loginUser = getUserByEmail(email, users);
    if (loginUser) {
      let pwMatch = bcrypt.compareSync(password, loginUser.password);
      if (pwMatch) {
        //res.cookie('user_id', loginUser.id);
        req.session.user_id = loginUser.id; 
        res.redirect('/urls');
      } else {
        //if it is not in the user object, or password does not match, send 403
        res.redirect(403, '/login');
      }
    } else {
      //if it is not in the user object, or password does not match, send 403
      res.redirect(403, '/login');
    }
  }
  
});

app.post('/logout', (req, res) => {
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  //console.log(req.body);


  let email = req.body.email;
  let password = req.body.password;
  let emailExist = getUserByEmail(email, users);

  if (!email || !password || emailExist) {
    res.redirect(400, '/register');
  } else {
    let uid = generateRandomString();
    let hashPW = bcrypt.hashSync(password, 10);
    users[uid] = {id: uid, email, password:hashPW};
    //console.log(users);
    //res.cookie('user_id', uid);
    req.session.user_id = uid;
    res.redirect('/urls');
  }
  
});


app.listen(PORT, () => {
  console.log(`Example app listnening on port ${PORT}`);
});