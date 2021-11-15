// Dependencies
const express = require('express');


/*


sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo certbot certonly --standalone
www.bluepyrami.de

193.197.228.28
2001:7c0:2330:137:f816:3eff:fe01:9c40

Certificate is saved at: /etc/letsencrypt/live/www.bluepyrami.de/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/www.bluepyrami.de/privkey.pem


*/

/////////////////////////////////////////////////////////////////////////////80
// General Purpose STATIC Web Server
// andreas.roessler@hs-esslingen.de
// 08.02.2018
let https = require( 'https' );
let fs = require( 'fs' );
let path = require( 'path' );
let secureport = process.env.SPORT || 443;
let port = process.env.PORT || 80;
let publicdir = "public";
let scriptdir = path.dirname( process.argv[ 1 ] );
/////////////////////////////////////////////////////////////////////////////80
let certdir = path.join( scriptdir, 'certs' );
let credentials = {
  key: fs.readFileSync( path.join( certdir, 'privkey.pem' ) ),
  cert: fs.readFileSync( path.join( certdir, 'fullchain.pem' ) )
};
/////////////////////////////////////////////////////////////////////////////80
let express = require( 'express' );
let app = express();
for ( let i = 2; i < process.argv.length; i++ ) {
  let path_string = process.argv[ i ]
  if ( fs.existsSync( path_string ) && fs.lstatSync( path_string ).isDirectory() ) {
    console.log( 'add to public', path_string );
    app.use( express.static( path_string ) );
  }
}
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