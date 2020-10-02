const express = require('express');
const morgan = require('morgan');
//const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./helpers/generateRandomString');
const { urlsForUser } = require('./helpers/urlsForUser');
const { getUserByEmail } = require('./helpers/getUserByEmail');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  r4f523: { longURL: 'https://duckduckgo.com', userID: 'userRandomID'}
};


//=========================MIDDLEWARE==============================//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name:'session',
  keys: ['catzR@m@z!ngi<3th3m'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

//================== DATABASES & HELPER FUNC ========================//
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

//Helper: sets http status code, and passes user and errorMsg to error page.
const renderErrorPage = function(res, httpCode, user, errMsg) {
  res.status(httpCode);
  const errVars = {
    errMsg,
    user
  };
  res.render('pages/error', errVars);
};

//=================================GET====================================//

// GET / -> redirect to /urls when logged in, redirect to /login otherwise
app.get('/', (req, res) => {
  let user = req.session.userID;
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET /urls -> show table of urls if logged in, display message otherwise
app.get('/urls', (req, res) => {

  let { userID } = req.session;
  let user = users[userID];

  let userURLS = urlsForUser(userID, urlDatabase);
  
  const templateVars = {
    title:"URL Index",
    urls: userURLS,
    user,
  };
  
  res.render('pages/urls_index', templateVars);
});

// GET /urls/new -> show form to add new link if logged in, redirect to login otherwise
app.get('/urls/new', (req, res) => {
  let { userID } = req.session;
  let user = users[userID];

  if (user) {
    const templateVars = {
      user
    };
    res.render('pages/urls_new', templateVars);
  } else {
    res.redirect(401, "/login");
  }
});

// GET /urls/:shortURL -> show shortURL details if logged in and owned, show appropriate message otherwise
app.get('/urls/:shortURL', (req, res) => {

  let { userID } = req.session;
  let { shortURL } = req.params;
  let urlData = urlDatabase[shortURL];

  if (!userID) {
    //not logged in
    res.render('pages/urls_show', {user:undefined, shortURL, longURL:'/urls'});
  } else if (!urlData) {
    //invalid shortURL id
    res.render('pages/urls_show', {user:users[userID], shortURL:undefined, longURL:undefined});
  } else if (urlData.userID !== userID) {
    //invalid access
    res.render('pages/urls_show', {user:users[userID], shortURL, longURL:undefined});
  } else {
    const urlVars = {
      shortURL:shortURL,
      longURL:urlData.longURL,
      user:users[userID],
    };
    res.render('pages/urls_show', urlVars);
  }

});

// GET /u/:shortURL -> redirect to specified longURL. render error page otherwise
app.get('/u/:shortURL', (req, res) => {
  let { shortURL } = req.params;
  const link = urlDatabase[shortURL];

  if (link) {
    res.redirect(link.longURL);
  } else {
    let { userID } = req.session;
    renderErrorPage(res, 404, users[userID], "404. This link does not exist.");
  }
});

// GET /register -> render registration form if not logged in. redirect to /urls otherwise
app.get('/register', (req, res) => {
  let { userID } = req.session;

  if (userID) {
    res.redirect('/urls');
  } else {
    res.render('pages/account_new', { user:undefined });
  }
});

// GET /login -> render login form if not logged in. redirect to /urls otherwise
app.get('/login', (req, res) => {
  let { userID } = req.session;

  if (userID) {
    res.redirect('/urls');
  } else {
    res.render('pages/account_login', { user:undefined, errMsg:undefined });
  }
});

//====================POST==============================//

//POST /urls -> add new URL to urlDatabase with user's ID.
app.post('/urls', (req, res) => {
  let { userID } = req.session;

  if (userID) {
    let newCode = generateRandomString();
    let { longURL } = req.body;
    urlDatabase[newCode] = {
      longURL,
      userID: userID,
    };
    res.statusCode = 302;
    res.redirect(`/urls/${newCode}`);
  } else {
    renderErrorPage(res, 401, undefined, "401. You must be logged in to complete this action.");
  }
});

//POST /urls/:shortURL/delete -> delete specified shortURL from database if authorized
app.post('/urls/:shortURL/delete', (req, res) => {
  let { userID } = req.session;

  if (userID) {
    let deleteID = req.params.shortURL;
    
    //check link exists
    if (urlDatabase[deleteID]) {
      //check link belongs to user
      if (urlDatabase[deleteID].userID === userID) {
        delete urlDatabase[deleteID];
        res.redirect('/urls');

      } else {
        renderErrorPage(res, 401, users[userID], "401. Your account is not allowed to modify this link");
      }

    } else {
      renderErrorPage(res, 404,  users[userID], "404. This link does not exist.");
    }
  } else {
    //no user logged in
    renderErrorPage(res, 401, undefined, "401. You must be logged in to complete this action.");
  }
});

//POST /urls/:shortURL -> update longURL for specified shortURL in urlDatabase if authorized
app.post('/urls/:shortURL', (req, res) => {
  let { userID } = req.session;

  if (userID) {
    let modID = req.params.shortURL;

    //check link exists
    if (urlDatabase[modID]) {
      
      //check user owns link
      if (urlDatabase[modID].userID === userID) {
        let longURL = req.body['new-longURL'];
        urlDatabase[modID] = {longURL, userID};
        res.redirect('/urls');
      } else {
        renderErrorPage(res, 401, users[userID], "401. Your account is not allowed to modify this link");
      }

    } else {
      renderErrorPage(res, 404,  users[userID], "404. This link does not exist.");
    }
  } else {
    renderErrorPage(res, 401, undefined, "401. You must be logged in to complete this action.");
  }
});

//POST /login -> sets session cookies if email/pw credentials are valid
app.post('/login', (req, res) => {

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
        req.session.userID = loginUser.id;
        res.redirect('/urls');
      } else {
        res.redirect(403, '/login');
      }

    } else {
      //email not in users
      res.redirect(403, '/login');
    }
  }
  
});

//POST /logout -> clears session cookies when clicked
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//POST /register -> adds user to users database with valid email/pw input
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let emailExist = getUserByEmail(email, users);

  if (!email || !password || emailExist) {
    res.redirect(400, '/register');
  } else {
    let userID = generateRandomString();
    let hashPW = bcrypt.hashSync(password, 10);
    users[userID] = {id: userID, email, password:hashPW};

    //Can be used to test hashed pw
    // console.log(users);
    
    req.session.userID = userID;
    res.redirect('/urls');
  }
  
});

//========================== SERVER LISTENER ================================
app.listen(PORT, () => {
  console.log(`Example app listnening on port ${PORT}`);
});