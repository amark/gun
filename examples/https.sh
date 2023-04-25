#!/bin/bash
echo $EMAIL
echo $WEBROOT
echo $DOMAIN

cd ~
git clone https://github.com/acmesh-official/acme.sh.git
bash ./acme.sh/acme.sh --install -m $EMAIL
bash ./acme.sh/acme.sh --issue -d $DOMAIN -w $WEBROOT
bash ./acme.sh/acme.sh --install-cert -d $DOMAIN --key-file ~/key.pem --fullchain-file ~/cert.pem --reloadcmd "service relay force-reload"~