#!/bin/bash

#debian/ubuntu
sudo apt-get update -y
sudo apt-get install curl git git-core -y
#fedora/openSUSE
sudo yum check-update -y
sudo yum install curl git git-core -y

#install nodejs
git clone http://github.com/isaacs/nave.git
sudo ./nave/nave.sh usemain stable

npm install gun

cd ./node_modules/gun/examples

npm install .

sudo /usr/local/bin/node ./all.js
