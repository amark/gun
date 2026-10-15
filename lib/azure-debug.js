;module.exports = function(a, own){
	const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

	a = a || (typeof Gun !== 'undefined' ? Gun : null) || {};

	function AzureBlob(opt){
		if(!(this instanceof AzureBlob)){
			return new AzureBlob(opt);
		}

		var az = this;
		opt = opt || {};
		opt.connectionString = opt.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_BLOB_CONNECTION_STRING;
		opt.accountName = opt.accountName || process.env.AZURE_BLOB_ACCOUNT_NAME || process.env.AZURE_STORAGE_ACCOUNT_NAME;
		opt.accountKey = opt.accountKey || process.env.AZURE_BLOB_ACCOUNT_KEY || process.env.AZURE_STORAGE_ACCOUNT_KEY;
		opt.containerName = opt.containerName || process.env.AZURE_BLOB_CONTAINER_NAME || process.env.AZURE_BLOB_CONTAINER || process.env.AZURE_STORAGE_CONTAINER_NAME;

		az.config = opt;
		if (a && typeof a.on === 'function') {
			az.on = a.on.bind(a);
		} else {
			var events = {};
			az.on = function(id, cb) {
				if (typeof cb === 'function') {
					events[id] = events[id] || [];
					events[id].push(cb);
					return {
						off: function() {
							var arr = events[id];
							if (arr) {
								var idx = arr.indexOf(cb);
								if (idx !== -1) arr.splice(idx, 1);
							}
						}
					};
				} else if (Array.isArray(cb)) {
					var list = events[id] ? events[id].slice() : [];
					for (var i = 0; i < list.length; i++) {
						list[i](cb);
					}
				}
			};
		}

		if (opt.containerClient) {
			az.containerClient = opt.containerClient;
		} else if (opt.connectionString) {
			const blobServiceClient = BlobServiceClient.fromConnectionString(opt.connectionString);
			az.containerClient = blobServiceClient.getContainerClient(opt.containerName);
		} else if (opt.accountName && opt.accountKey && opt.containerName) {
			const storageAccountBaseUrl = opt.accountUrl || `https://${opt.accountName}.blob.core.windows.net`;
			const sharedKeyCredential = new StorageSharedKeyCredential(opt.accountName, opt.accountKey);
			const blobServiceClient = new BlobServiceClient(
				storageAccountBaseUrl,
				sharedKeyCredential
			);
			az.containerClient = blobServiceClient.getContainerClient(opt.containerName);
		} else {
			console.log("Azure Blob Storage options (accountName, accountKey, containerName) or connectionString are required.");
			return 0;
		}

		if (az.containerClient && typeof az.containerClient.createIfNotExists === 'function') {
			az.ready = az.containerClient.createIfNotExists().catch((error) => {
				console.error("Error with container setup:", error.message || error);
			});
		} else {
			az.ready = Promise.resolve();
		}

		return az;
	}

	AzureBlob.id = function(m){ return (m.containerName || '') + '/' + (m.key || ''); };
	AzureBlob.chain = AzureBlob.prototype;

	AzureBlob.chain.PUT = async function(key, o, cb){
		if(!key){ return this; }
		var data;
		if(typeof o === 'object' && o !== null){
			data = JSON.stringify(o);
		} else {
			data = (typeof o === 'string') ? o : String(o);
		}

		try {
			await this.ready;
			const blobClient = this.containerClient.getBlockBlobClient(key);
			const content = Buffer.from(data, 'utf8');
			await blobClient.uploadData(content);
			if(cb){ cb(null, {ok: true}); }
		} catch(e) {
			if(cb){ cb(e); }
		}
		return this;
	};

	AzureBlob.chain.GET = function(key, cb){
		if(!key){ return this; }
		var az = this;
		var m = {
			containerName: az.config.containerName,
			key: key
		};
		var id = AzureBlob.id(m);

		if (az.on) {
			var listener = az.on(id, function(arg){
				var e = arg[0], d = arg[1], t = arg[2], m = arg[3], r = arg[4];
				if (listener && typeof listener.off === 'function') {
					listener.off();
				}
				delete az.batch[id];
				if(typeof cb === 'function'){
					try{ cb(e, d, t, m, r); }catch(err){ console.log(err); }
				}
			});
		}

		az.batch = az.batch || {};
		if(az.batch[id]){ return az; }
		az.batch[id] = (az.batch[id] || 0) + 1;

		(async function(){
			try {
				await az.ready;
				const blobClient = az.containerClient.getBlockBlobClient(key);
				const buffer = await blobClient.downloadToBuffer();
				const t = buffer.toString('utf8');
				var d;
				try { d = JSON.parse(t); } catch(e) { d = t; }
				if (az.on) {
					az.on(id, [null, d, t, {}, {}]);
				} else if (typeof cb === 'function') {
					cb(null, d, t);
				}
			} catch(e) {
				var isNotFound = e.statusCode === 404 ||
				                 e.code === 'BlobNotFound' ||
				                 (e.details && e.details.errorCode === 'BlobNotFound');
				var err = isNotFound ? null : e;
				if (az.on) {
					az.on(id, [err, undefined, undefined]);
				} else if (typeof cb === 'function') {
					cb(err, undefined);
				}
			}
		}());
		return az;
	};

	AzureBlob.chain.del = async function(key, cb){
		if(!key){ return this; }
		try {
			await this.ready;
			const blobClient = this.containerClient.getBlockBlobClient(key);
			var r;
			if (typeof blobClient.deleteIfExists === 'function') {
				r = await blobClient.deleteIfExists();
			} else {
				r = await blobClient.delete();
			}
			if(cb){ cb(null, r); }
		} catch(e) {
			if(cb){ cb(e); }
		}
		return this;
	};

	AzureBlob.chain.keys = async function(prefix, cb){
		if (typeof prefix === 'function') {
			cb = prefix;
			prefix = '';
		}
		var opts = {};
		if(typeof prefix === 'string' && prefix){
			opts.prefix = prefix;
		}

		try {
			await this.ready;
			const blobs = [];
			for await (const blob of this.containerClient.listBlobsFlat(opts)) {
				blobs.push(blob.name);
			}
			if(typeof cb === 'function'){
				cb(null, blobs);
			}
		} catch(e) {
			if(typeof cb === 'function'){
				cb(e);
			}
		}
		return this;
	};

	return AzureBlob;
};
/**
Azure Blob Storage config is:
 {
	accountName: process.env.AZURE_BLOB_ACCOUNT_NAME = ''
	,accountKey: process.env.AZURE_BLOB_ACCOUNT_KEY = ''
	,containerName: process.env.AZURE_BLOB_CONTAINER_NAME = ''
	// Or connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING = ''
}
**/
