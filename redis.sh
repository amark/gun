if [ -e redis-stable ];
then
	echo "redis already installed."
else
	echo "installing redis"
	curl -O http://download.redis.io/redis-stable.tar.gz
	tar xvzf redis-stable.tar.gz
	cd redis-stable
	make
	echo "redis installed"
	cd ..
fi
cd redis-stable
src/redis-server