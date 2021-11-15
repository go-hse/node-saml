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
const http = require( 'http' );
const https = require( 'https' );
const fs = require( 'fs' );
const path = require( 'path' );
const secureport = process.env.SPORT || 8443;
const standardport = process.env.PORT || 8080;
/////////////////////////////////////////////////////////////////////////////80
const certdir = "/etc/letsencrypt/live/www.bluepyrami.de";
const credentials = {
  key: fs.readFileSync( path.join( certdir, 'privkey.pem' ), "utf8" ),
  cert: fs.readFileSync( path.join( certdir, 'fullchain.pem' ) , "utf8" ),
};
/////////////////////////////////////////////////////////////////////////////80
const app = express();

app.use("/info", (req, res) => {
  res.send('Hello Info!');
});

app.use((req, res) => {
  res.send('Hello All!');
});

/////////////////////////////////////////////////////////////////////////////80
https.createServer( credentials, app ).listen( secureport, function() {
  console.log( '%s Node HTTPS server started on port %d ...', Date( Date.now() ), secureport );
} );

/////////////////////////////////////////////////////////////////////////////80
// Redirect from http standardport 8080 to https
http.createServer( function( req, res ) {
  const host = req.headers[ 'host' ].replace( '' + port, '' + secureport );
  res.writeHead( 301, {
    "Location": "https://" + host + req.url
  } );
  res.end();
} ).listen( standardport, function() {
  console.log( '%s Node HTTP redirect started on port %d ...', Date( Date.now() ), standardport );
} );