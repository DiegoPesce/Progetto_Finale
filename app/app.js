const express = require('express');
const app = express();
const mongo = require('./modules/mongodb.js');
const bodyparser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const Client = require('node-rest-client').Client;
var client = new Client();
const fs = require('fs');
const https = require('https');

/*
var server = https.createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.cert')
}, app);
*/

// Cors
app.use(cors());

// Session
app.use(
    session({
      secret: 'password',
      resave: false,
      saveUninitialized: false
    })
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyparser.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(bodyparser.json());

app.get('/', function (req, res) {
    res.send("It works!");
});

app.post('/register', function (req, res) {
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var data_nascita = req.body.data_nascita;

    mongo.insert({
            nome : nome,
            cognome : cognome,
            username : username,
            password : password,
            email : email,
            data_nascita : data_nascita
        })
        .then(result => {
            if (result.result.n == 1) {
                res.send(true);
            }else{
                res.send(false);
            }
        })

});

app.post('/login', function (req, res) {
    console.log(req.session)
    if (req.session.logged == false || req.session.logged == undefined){
        var username = req.body.username;
        var password = req.body.password;

        mongo.login({
                username : username,
                password : password,
            })
        .then(result => {
            if (result == 1) {
                req.session.logged = true;
                req.session.username = username;
                res.send(true);
            }else{
                req.session.logged = false;
                req.session.username = username;
                res.send(false);
            }

        });

    }else{
        res.send(false);
    }

});

app.post('/unlock', function (req, res) {
    if(req.session.logged){
        var qr = req.body.qr;
        client.post(url + '/unlock', qr, function (data, response) {
            // parsed response body as js object
            console.log(data);
            // raw response
            console.log(response);
        });
    }
});

app.post('/logout', function (req, res) {
    if(req.session.logged){
        var username = req.body.username;

        if(req.session.username == username){
            req.session.logged = false;
        }
    }
});

app.get('/delete', function (req, res) {
    mongo.cancellaMacelloMontini();
    res.send("It works!");
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

/*
server.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
*/


///////////// functions