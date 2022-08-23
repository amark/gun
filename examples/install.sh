#!/bin/bash

# README
# This will install nodejs and npm on your system,
# should work on most places other than Windows.
# Set any environment variables before you run this,
# like `export RAD=false` to disable storage, or
# pass file paths of `HTTPS_CERT` & `HTTPS_KEY`, etc.
# Copy paste and run each line into your terminal.
# If you are on Windows, http://nodejs.org/download/ has
# an installer that will automatically do it for you.
# curl -o- https://raw.githubusercontent.com/amark/gun/master/examples/install.sh | bash

#debian/ubuntu
su -
apt-get install sudo -y
sudo apt-get update -y
sudo apt-get install curl git git-core screen -y
#fedora/openSUSE
sudo yum check-update -y
sudo yum install curl git git-core screen -y

# install nodejs
git clone http://github.com/isaacs/nave.git
sudo ./nave/nave.sh usemain stable
# If you just want nodejs and npm but not gun, stop here.

npm install gun
cd ./node_modules/gun
npm install .

# to start the gun examples:
screen -S relay
sudo npm start 80 # change `80` to `443` for https or `8765` for development purposes.
# You can now safely CTRL+A+D to escape without stopping the peer. To stop `killall screen` or `killall node`.
