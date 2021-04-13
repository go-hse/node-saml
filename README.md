# ID-Management with Keycloak and Node.js

## Prerequistes
0. Linux OS preferred - may work with Windows, too, but is not tested
1. Docker with docker-compose
2. openssl for generation of certificates
3. Node.js for Testing


## SAML with  Keycloak

1. Start containers:

```bash
docker-compose up -d
```

2. Open Admin-Console

http://localhost:8080/auth/

User: admin, Password: admin (same as in docker-compose.yml, should be changed) 

3. Configure Keycloak
* Create a realm - `hse`
* Create a client - `node` (Client Protocol: saml)
* Configure client `node` settings:
  * Valid Redirect URIs: http://localhost:8100/*
  * Master SAML Processing URL: http://localhost:8100/login/callback
  * Save settings

* Get/Save XML-File from http://localhost:8080/auth/realms/hse/protocol/saml/descriptor
  * Save Content of `<ds:X509Certificate>` to `<projectdir>`/certs/idp_cert.pem

* Goto SAML Keys, Export, Archive Format: PKCS12, example password "1234", 
  * Downloaded result: `<projectdir>/keystore.p12`

4. Extract Key and Cert from `keystore.p12`

These keys/certs are stored in `<projectdir>/certs`

```bash
cd <projectdir>
mkdir certs
openssl pkcs12 -in keystore.p12 -nocerts -out certs/privateKey.pem -passin pass:"1234"
```

Remove Password from Private Key
```bash
openssl rsa -in certs/privateKey.pem -out certs/key.pem -passin pass:"1234"
```

Extract server public key

```
openssl pkcs12 -in keystore.p12 -clcerts -nokeys -out certs/server.crt
```

5. Add users (see Manage Users)

6. Login to Keycloak as User

* User Login: http://localhost:8080/auth/realms/hse/account/

* Save user name, password
 
* Sign out

7. Open WebApp

* Install Node.js with npm (https://nodejs.org/en/)

* In project directory: 
```bash

# install node dependancies
npm i

# start node web server
node app.js

```
* Open in browser http://localhost:8100/

* Click Login - Keycloak Login-Page should open

* Login as User - Redirect to http://localhost:8100/saml 

SUCCESS!


## Useful Commands:

```bash

# Stop docker containers
docker-compose down

# list all containers
docker ps –a

# remove container
docker rm <container-id>


# list images
docker image ls

# remove image
docker rmi image-id

```

### To Reset:

* Remove containers
* Remove DB in directory ./.mysql-data




## Credits/Sources: 

Node/Express-App from https://codeburst.io/keycloak-and-express-7c71693d507a

## Links
https://www.keycloak.org/docs/latest/getting_started/index.html
