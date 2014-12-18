#!/bin/bash

# curl -fsSL http://gunDB.io/example.sh | bash -c

echo ""
echo ""

echo "updating apt-get..."
sudo bash -c "apt-get update -qq -y < /dev/null" > /dev/null

# git, wget, curl, build-essential
if [ -z "$(which git | grep git)" ] || [ -z "$(which wget | grep wget)" ] || [ -z "$(which curl | grep curl)" ] || [ -z "$(which gcc | grep gcc)" ] || [ -z "$(which rsync | grep rsync)" ]
then
  echo "installing git, wget, curl, build-essential, rsync..."
  sudo bash -c "apt-get install -qq -y git wget curl build-essential rsync < /dev/null" > /dev/null 2>/dev/null
fi

# node
NODE_VER=v0.11.14
CUR_NODE_VER=$(node -v 2>/dev/null)
if [ -n "$(which node | grep node)" ] && [ "${NODE_VER}" == "$(node -v 2>/dev/null)" ]; then
#if [ "${NODE_VER}" == "${CUR_NODE_VER}" ]; then
  echo node ${NODE_VER} already installed
else
  echo "installing node ${NODE_VER}..."
  curl -fsSL "http://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-linux-x64.tar.gz" \
    -o "/tmp/node-${NODE_VER}-linux-x64.tar.gz"
  pushd /tmp
  tar xf /tmp/node-${NODE_VER}-linux-x64.tar.gz
  rm node-${NODE_VER}-linux-x64/{LICENSE,ChangeLog,README.md}
  sudo rsync -a /tmp/node-${NODE_VER}-linux-x64/ /usr/local/
  sudo chown -R $(whoami) /usr/local
fi

mkdir -p ~/gun
cd ~/gun
npm install gun
cd ./node_modules/gun/examples
npm install .
node all.js

echo ""