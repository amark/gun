#!/bin/bash
#To initiate this script, remember to dos2unix if on windows, then run the following,
#where $USER and $IP is the default username and IP of your remote Ubuntu 12.04 machine:
#scp assemble.sh $USER@$IP:/home/$USER/ && ssh $USER@$IP 'bash ./assemble.sh'

#NODE=http://nodejs.org/dist/v0.8.15/node-v0.8.15-linux-x64.tar.gz #binary
NODE=http://nodejs.org/dist/v0.8.15/node-v0.8.15.tar.gz
MONGO=http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.4.1.tgz
REDIS=http://redis.googlecode.com/files/redis-2.6.6.tar.gz
PHANTOM=http://phantomjs.googlecode.com/files/phantomjs-1.5.0-linux-x86_64-dynamic.tar.gz
ZMQ=http://download.zeromq.org/zeromq-3.2.0-rc1.tar.gz

IP=`curl -s checkip.dyndns.org | grep -Eo '[0-9\.]+'`
USER=`whoami`

echo "creating theory"

cd ~
if [ -d theory ]; 
then
	echo "theory folder already exists"
else
	mkdir theory
fi

echo "getting core"
sudo apt-get update -y
sudo apt-get install wget curl zsh git-core build-essential openssl libssl-dev upstart monit libtool autoconf uuid-dev lvm2 xfsprogs -y
sudo apt-get install mdadm --no-install-recommends -y

cd ~/theory
if [ -e /usr/local/bin/node ];
then
	echo "node already installed."
else
	#TODO: REPLACE THE FOLLOWING BUILD WITH NAVE INSTEAD, TO MAKE THINGS FAST!
	echo "installing node"
	wget -O node.tar.gz $NODE
	mkdir node
	tar -zxf node.tar.gz -C node --strip-components 1
	cd node
	./configure
	make
	sudo make install
	echo "node installed"
fi

cd ~/theory
if [ -e /data/db ];
then
	echo "drives already configured"
else
	#Mark's version
	echo "configuring drives"
	DRIVES=`sudo node -e "var proc = require('child_process');
	proc.exec('lsblk -l',function(e,stdout){
		stdout = stdout.split(/\n/g);var s='';
		for(var i=1; i<stdout.length; i++){
			var l=stdout[i].split(/\s+/ig);
			if(l[l.length-1]==='' && l[0]){s+=' /dev/'+l[0];}
		}console.log(s.substring(1));
	});"`
	echo $DRIVES
	RNUM=`sudo node -e "console.log(('${DRIVES}'.split(/\s/ig)||[]).length);"`
	sudo mdadm --create --verbose /dev/md0 --level=10 --chunk=256 --raid-devices=$RNUM $DRIVES
	echo DEVICE $DRIVES | sudo tee /etc/mdadm/mdadm.conf
	sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf
	sudo blockdev --setra 256 /dev/md0
	sudo dd if=/dev/zero of=/dev/md0 bs=512 count=1
	sudo pvcreate /dev/md0
	sudo vgcreate vg0 /dev/md0
	sudo lvcreate -l 90%vg -n data vg0
	sudo lvcreate -l 5%vg -n log vg0
	sudo lvcreate -l 5%vg -n journal vg0
	sudo mkfs.xfs -f /dev/vg0/data
	sudo mkfs.xfs -f /dev/vg0/log
	sudo mkfs.xfs -f /dev/vg0/journal
	sudo mkdir /data /data/db /data/journal
	echo '/dev/vg0/data /data/db xfs defaults,auto,noatime,noexec 0 0' | sudo tee -a /etc/fstab
	echo '/dev/vg0/log /var/log xfs defaults,auto,noatime,noexec 0 0' | sudo tee -a /etc/fstab
	echo '/dev/vg0/journal /data/journal xfs defaults,auto,noatime,noexec 0 0' | sudo tee -a /etc/fstab
	sudo mount /data/db
	sudo mount /var/log
	sudo mount /data/journal
	sudo ln -s /data/journal /data/db/journal
	echo "drives configured"
	#permissions set in mongo install
fi

cd ~/theory
if [ -e /usr/local/bin/mongod ];
then
	echo "mongo already installed."
else
	echo "installing mongo"
	wget -O mongo.tar.gz $MONGO
	mkdir mongo
	tar -zxf mongo.tar.gz -C mongo --strip-components 1
	cd mongo/bin
	sudo cp * /usr/local/bin/
	sudo mkdir -p /data/db
	sudo chown ubuntu -fR /data /data/db /data/journal /var/log
	sudo chown $USER -fR /data /data/db /data/journal /var/log
	echo "mongo installed"
fi

cd ~/theory
if [ -e /usr/local/bin/redis-server ];
then
	echo "redis already installed."
else
	echo "installing redis"
	wget -O redis.tar.gz $REDIS
	mkdir redis
	tar -zxf redis.tar.gz -C redis --strip-components 1
	cd redis
	make
	sudo cp redis-server redis-cli redis-benchmark /usr/local/bin
	sudo ln -s ~/theory/redis/src/redis-server /usr/local/bin/redis-server
	sudo ln -s ~/theory/redis/src/redis-cli /usr/local/bin/redis-cli
	echo "redis installed"
fi

cd ~/theory
if [ -e /usr/local/bin/phantomjs ];
then
	echo "phantom already installed."
else
	echo "installing phantom"
	wget -O phantom.tar.gz $PHANTOM
	mkdir phantom
	tar -zxf phantom.tar.gz -C phantom --strip-components 1
	sudo ln -s ~/theory/phantom/bin/phantomjs /usr/local/bin/phantomjs
	echo "phantom installed"
fi

cd ~/theory
if [ -e /usr/local/include/zmq.h ];
then
	echo "ZMQ already installed."
else
	echo "installing ZMQ"
	wget -O zmq.tar.gz $ZMQ
	mkdir zmq
	tar -zxf zmq.tar.gz -C zmq --strip-components 1
	cd zmq
	sudo ./configure
	sudo make
	sudo make install
	sudo ldconfig
	echo "zmq installed"
fi

cd ~/theory
if [ -e ~/theory/code ];
then
	echo "code already exists."
else
	echo "Tuning:"
	echo "1024 65535" > /proc/sys/net/ipv4/ip_local_port_range
	echo "fs.file-max = 999999
	net.ipv4.tcp_rmem = 4096 4096 16777216
	net.ipv4.tcp_wmem = 4096 4096 16777216" | sudo tee - a /etc/sysctl.conf
	sudo mv /etc/cron.weekly/apt-xapian-index /etc/cron.monthly/apt-xapian-index
	
	PWD=`pwd`
	echo "creating and initializing code"
	sudo ln -s $PWD /usr/local/bin/theory
	mkdir code
	echo "var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World');
}).listen(80);console.log('running at 80');" > code/init.js
	mkdir git
	cd git
	git init --bare
	PWD=`pwd`
	echo "====== DO LOCALLY ======"
	echo "git init"
	echo "git add ."
	echo "git commit -m 'init'"
	echo "git remote add web ssh://$USER@$IP$PWD"
	echo "git push web master"
	echo "====== END LOCAL ======"
	echo "#!/bin/sh
sudo stop theory
GIT_WORK_TREE=/usr/local/bin/theory/code git checkout -f
sudo start theory
echo 'deployed'" > hooks/post-receive
	chmod +x hooks/post-receive
	cd ~/theory
	sudo echo "limit nofile 999999 999999

description 'start theory'
author 'theory'

start on runlevel [2345]
stop on shutdown

respawn

script
	sudo NODE_ENV=production /usr/local/bin/node /usr/local/bin/theory/code/init.js >> /var/log/theory.log 2>&1
end script" > theory.conf
	sudo mv theory.conf /etc/init/
	
	sudo echo "set daemon 7
include /etc/monit/conf.d/*

check system theory
set httpd port 8080 and
	allow theory:symphony
" > monitrc
	sudo mv monitrc /etc/monit/
	
	sudo echo "check host theory_init with address 127.0.0.1
start program = '/sbin/start theory'
stop program  = '/sbin/stop theory'
if failed port 80 protocol HTTP
	request /
	with timeout 2 seconds
	then restart
" > theory
	sudo mv theory /etc/monit/conf.d/
	sudo chown -fR ubuntu ~/theory
	sudo chown -fR $USER ~/theory
fi

sudo start theory
echo "DONE :) $IP"

# STUFF TO WORK ON:
#SCALE ON: (in node)
#os.freemem() / os.totalmem() 80% ~ 100% for a few days
#node-aws auto controls
