# from
# https://github.com/keycloak/keycloak/blob/main/testsuite/integration-arquillian/tests/other/console/src/main/resources/saml-keys/README.md

CERTDIR=certs

mkdir $CERTDIR
touch $CERTDIR/idp_cert.pem

# this file contains the passphrase
touch P12phrase

# Generate the Key
openssl genrsa -out $CERTDIR/client.key 2048

# Create a signing request
openssl req -new -key $CERTDIR/client.key -out $CERTDIR/certificate.csr -subj "/C=DE/ST=BW/L=Esslingen/O=HSE/OU=MCI/CN=saml.client.local"
openssl x509 -req -in $CERTDIR/certificate.csr -signkey $CERTDIR/client.key -out $CERTDIR/client.pem

# file to upload to keycloak
openssl pkcs12 -export -passin pass:secret -password file:P12phrase -in $CERTDIR/client.pem -inkey $CERTDIR/client.key -out $CERTDIR/client.p12 -name "samlKey"
# keycloak - clients - keys - import PKCS12 - keyAlias samlKey - password: $PASSWORD

openssl pkcs12 -nodes -in $CERTDIR/client.p12 -no$CERTDIR -out $CERTDIR/privateKey.pem -passin file:P12phrase
# these $CERTDIR are used in node
openssl rsa -in $CERTDIR/privateKey.pem -out $CERTDIR/key.pem -passin file:P12phrase
openssl pkcs12 -in $CERTDIR/client.p12 -cl$CERTDIR -nokeys -out $CERTDIR/server.crt -passin file:P12phrase

rm $CERTDIR/client.pem
rm $CERTDIR/client.key
rm $CERTDIR/certificate.csr
rm $CERTDIR/privateKey.pem
