/*eslint-env node*/

const express = require('express');
const app = express();
const mongo = require('./modules/mongodb.js');
const bodyparser = require('body-parser')

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyparser.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(bodyparser.json());

app.get('/', function (req, res) {
    res.writeHead(302, {
      'Location': '/register'
    });
    res.end();
});

app.post('/register', function (req, res) {
    var username = req.body.username;
    var
    mongo.insert()
        .then(result => {
            console.log(result)
        })
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
