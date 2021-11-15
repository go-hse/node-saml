/*


sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo certbot certonly --standalone
www.bluepyrami.de

193.197.228.28
2001:7c0:2330:137:f816:3eff:fe01:9c40

Certificate is saved at: /etc/letsencrypt/live/www.bluepyrami.de/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/www.bluepyrami.de/privkey.pem

https://www.bluepyrami.de:8443/
http://www.bluepyrami.de:8080/

*/

/////////////////////////////////////////////////////////////////////////////80
// General Purpose STATIC Web Server
// andreas.roessler@hs-esslingen.de
// 08.02.2018
let http = require( 'http' );
let https = require( 'https' );
let fs = require( 'fs' );
let path = require( 'path' );
let secureport = process.env.SPORT || 8443;
let port = process.env.PORT || 8080;
let publicdir = "public";
let scriptdir = path.dirname( process.argv[ 1 ] );
/////////////////////////////////////////////////////////////////////////////80
let certdir = "/etc/letsencrypt/live/www.bluepyrami.de";
let credentials = {
  key: fs.readFileSync( path.join( certdir, 'privkey.pem' ), "utf8" ),
  cert: fs.readFileSync( path.join( certdir, 'fullchain.pem' ) , "utf8" ),
};
/////////////////////////////////////////////////////////////////////////////80
let express = require( 'express' );
let app = express();

app.use((req, res) => {
  res.send('Hello there !');
});


/////////////////////////////////////////////////////////////////////////////80
https.createServer( credentials, app ).listen( secureport, function() {
  console.log( '%s Node HTTPS server started on port %d ...', Date( Date.now() ), secureport );
} );

/////////////////////////////////////////////////////////////////////////////80
// Redirect from http port 8080 to https
let http = require( 'http' );
http.createServer( function( req, res ) {
  let host = req.headers[ 'host' ].replace( '' + port, '' + secureport );
  res.writeHead( 301, {
    "Location": "https://" + host + req.url
  } );
  res.end();
} ).listen( port, function() {
  console.log( '%s Node HTTP redirect started on port %d ...', Date( Date.now() ), port );
} );