const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  //res.json(urlDatabase);
  const templateVars = {title:"URL Index", urls: urlDatabase};
  res.render('pages/urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>")
})
app.listen(PORT, () => {
  console.log(`Example app listnening on port ${PORT}`);
});