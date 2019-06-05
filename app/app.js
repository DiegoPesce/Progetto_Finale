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
app.use(cors({
    origin: [
        "https://4200-a74eec00-f2bd-4fcb-92a9-4ac080a1564d.ws-eu0.gitpod.io"
    ], credentials: true
}));

// Session
app.use(session({
    secret: 'password',
    resave: false,
    saveUninitialized: true
}));
var sess;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyparser.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(bodyparser.json());

app.get('/', function(req, res) {
    res.send("It works!");
});

app.post('/register', function(req, res) {
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var data_nascita = req.body.data_nascita;

    mongo.insert({
        nome: nome,
        cognome: cognome,
        username: username,
        password: password,
        email: email,
        data_nascita: data_nascita
    })
        .then(result => {
            if (result.result.n == 1) {
                res.send(true);
            } else {
                res.send(false);
            }
        })

});

app.post('/login', function(req, res) {
    console.log("here")
    sess = req.session;
    if (sess.logged == false || sess.logged == undefined) {
        var username = req.body.username;
        var password = req.body.password;

        mongo.login({
            username: username,
            password: password,
        })
            .then(result => {
                if (result == 1) {
                    sess.logged = true;
                    sess.username = username;
                    sess.prenotazione = false;
                    res.send(true);
                } else {
                    sess.logged = false;
                    res.send(false);
                }

            });

    } else {
        res.send(false);
    }

});

app.get('/getMonopattini', function(req, res) {
    sess = req.session;
    if (sess.logged) {
        mongo.getMonopattini()
            .then(result => {
                if (result) {
                    res.send(result);
                } else {
                    res.send(false);
                }

            }).catch(err => {
                throw err;
            });

    } else {
        res.send(false);
    }

});

app.post('/unlock', function(req, res) {
    sess = req.session;
    if (sess.logged) {
        var qr = req.body.qr;
        client.post(url + '/unlock', qr, function(data, response) {
            // parsed response body as js object
            console.log(data);
            // raw response
            console.log(response);
        });
    }
});

app.put('/prenota', function(req, res) {
    sess = req.session;
    if (sess.logged && sess.prenotazione == false) {
        var qr = req.body.qr;
        sess.dataPrenotazione = new Date();
        mongo.prenota(qr, sess.username, sess.dataPrenotazione).then(result => {
            if (result) {
                sess.prenotazione = true;
                res.send(true);
            } else {
                res.send(false);
            }
        });
    }
});

app.put('/rilascia', function(req, res) {
    sess = req.session;
    console.log(sess);
    if (sess.logged && sess.prenotazione == true) {
        var qr = req.body.qr;
        mongo.rilascia(qr, sess.username, sess.dataPrenotazione).then(result => {
            if (result) {
                res.send(true);
                sess.prenotazione = false;
            } else {
                res.send(false);
            }
        });
    }
});

app.get('/logout', function(req, res) {
    sess = req.session;
    if (sess.logged) {
        sess.destroy();
        res.send(false)
    }
});

app.get('/delete', function(req, res) {
    mongo.cancellaMacelloMontini();
    res.send("It works!");
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});

/*
server.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
*/


///////////// functions