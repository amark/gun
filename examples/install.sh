#!/bin/bash

# README
# This will install nodejs and npm on your system,
# should work on most places other than Windows.
# For it to run on boot as a server, a recent OS is needed.
# Set any environment variables before you run this,
# like `export RAD=false` to disable storage, or
# pass file paths of `HTTPS_CERT` & `HTTPS_KEY`, etc.
# Copy paste and run each line into your terminal.
# If you are on Windows, http://nodejs.org/download/ has
# an installer that will automatically do it for you.
# curl -o- https://raw.githubusercontent.com/amark/gun/master/examples/install.sh | bash
# wget -O - https://raw.githubusercontent.com/amark/gun/master/examples/install.sh | bash

#debian/ubuntu
cd ~
apt-get install sudo -y
sudo apt-get update -y
sudo apt-get install curl git git-core systemd -y
sudo apt-get install systemctl -y
#fedora/openSUSE
sudo yum check-update -y
sudo yum install curl git git-core systemd -y
sudo yum install curl systemctl -y

#screen -S install # You can safely CTRL+A+D to escape without stopping the process. `screen -R install` to resume. Stop all with `killall screen`. Note: May need to `sudo apt-get install screen`

# install nodejs
git clone https://github.com/isaacs/nave.git
./nave/nave.sh usemain stable

# If you just want nodejs and npm but not gun, stop here.
#npm install gun@latest
#cd ./node_modules/gun
mkdir node_modules
git clone https://github.com/amark/gun.git
cd gun
git checkout .
git pull
git checkout master
git checkout $VERSION
git pull
npm install .

cp ./examples/relay.service /lib/systemd/system/relay.service
echo $PWD >> /lib/systemd/system/relay.service
echo "fs.file-max = 999999" >> /etc/sysctl.conf
ulimit -u unlimited
sysctl -p /etc/sysctl.conf
systemctl daemon-reload
systemctl enable relay
systemctl restart relay