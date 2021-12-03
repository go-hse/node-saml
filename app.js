/*
    20.10.2020 (43) 16:16:29

    Example-App for ID-Management with
    Keycloak: ID Provider
    Node.js-App: Service Provider


    Using the SAML-Protocol

    derived from
    https://github.com/austincunningham/keycloak-express
    which uses openid-connect

*/

'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const { engine } = require('express-handlebars');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    console.log('Time: %d', Date.now(), req.method, req.url); // , req.body, req.params
    next()
});

// Register 'handelbars' extension with The Mustache Express
app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'layout.hbs', relativeTo: __dirname }));
app.set('view engine', '.hbs');
app.set('views', './views');

let memoryStore = new session.MemoryStore();

// session
app.use(session({
    secret: 'thisShouldBeLongAndSecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));


// unprotected route
app.get('/', function (req, res) {
    res.render('index');
});

app.use(express.static(path.resolve(__dirname, "public")));

const NODE_PORT = 8100

let http = require('http').createServer(app);
http.listen(NODE_PORT, () => {
    console.log('listening on *:', NODE_PORT);
});

/////////////////////////////////////////////////////////////////////////////80
// Socket.IO Connection
let socket_io = require('socket.io')(http);

function IoConnectServer(io_api, callbacks) {
    let uniqueID = 0;
    let no_of_clients = 0;
    io_api.on('connection', (socket) => {
        let currentClientID = ++uniqueID;
        ++no_of_clients;
        socket.emit('init', { id: currentClientID, no_of_clients });
        socket.on('disconnect', function () {
            --no_of_clients;
        });
        for (let cbName in callbacks) {
            let cb = callbacks[cbName];
            socket.on(cbName, (o) => {
                cb(socket, currentClientID, o);
            });
        }
    });
}

let callbacks = {
    open: function (socket, id, o) {
        console.log("open connection to client", id, o);
    },
    update: function (socket, id, o) {
        socket.broadcast.emit("update", o); // send to all others
    }
};

IoConnectServer(socket_io, callbacks);




/////////////////////////////////////////////////////////////////////////////80
// https://github.com/node-saml/passport-saml
const saml = require('passport-saml');
const passport = require('passport');


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

const CALLBACK_URL = `http://localhost:${NODE_PORT}/login/callback`
const ISSUER = "node"

// passed as option to docker
const ENTRY_POINT = "http://localhost:8080/auth/realms/hse/protocol/saml"

const publicKey = fs.readFileSync(__dirname + '/certs/server.crt', 'utf8');
const privateKey = fs.readFileSync(__dirname + '/certs/key.pem', 'utf8');

const saml_options = {
    callbackUrl: CALLBACK_URL,
    issuer: ISSUER,
    signatureAlgorithm: "sha256",
    entryPoint: ENTRY_POINT,
    identifierFormat: null,
    // The decryptionPvK and privateCert both refer to the local private key 
    // downloaded from keycloak - client - SAML keys - export (format: pks12)
    privateKey,
    decryptionPvk: privateKey,

    // IDP public key from the servers meta data
    cert: fs.readFileSync(__dirname + '/certs/idp_cert.pem', 'utf8'),
    validateInResponseTo: false,
    disableRequestedAuthnContext: true,
}

function saml_callback(profile, done) {
    console.log('Parsing SAML', profile);
    const user = {
        email: profile.email,
        group: profile.eduPersonAffiliation
    };
    return done(null, user);
}

const samlStrategy = new saml.Strategy(saml_options, saml_callback);
passport.use('samlStrategy', samlStrategy);

// 
app.get('/login', passport.authenticate('samlStrategy', { successRedirect: '/saml', failureRedirect: '/auth/fail' }));


app.use('/saml', (req, res, next) => {
    if (req.isAuthenticated()) res.render('saml', { title: 'Logged in' });
    else res.redirect('/');
});


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/login/callback', passport.authenticate('samlStrategy', { failureRedirect: '/auth/fail' }), (req, res, next) => {
    console.log('SSO Login ################', req.user);
    res.redirect('/saml');
});


// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout mykey.key -out certificate.crt

const metadata = samlStrategy.generateServiceProviderMetadata(publicKey, publicKey);
app.get('/metadata',
    function (req, res) {
        res.type('application/xml');
        res.status(200).send(metadata);
    }
);